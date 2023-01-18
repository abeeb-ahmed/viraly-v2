import { useContext, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

const Comments = ({ postId }) => {
  const { currentUser } = useContext(AuthContext);
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();

  // comments get request using react query
  const commentsQuery = useQuery(["comments", postId], async () => {
    let comments = [];
    const q = query(collection(db, "posts"), where("id", "==", postId));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      comments.push(doc.data().comments);
    });

    const sortedComments = comments[0]?.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    return sortedComments;
  });

  // add comment post request using react query
  const mutation = useMutation(
    async (newComment) => {
      const id = uuidv4();
      let docId;
      const q = query(collection(db, "posts"), where("id", "==", postId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        docId = doc.id;
      });

      const commentsRef = doc(db, "posts", docId);

      await updateDoc(commentsRef, {
        comments: arrayUnion({
          id,
          message: newComment.message,
          senderId: currentUser.uid,
          photoURL: currentUser.photoURL,
          name: currentUser.name,
          createdAt: Date.now(),
        }),
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments"]);
      },
    }
  );

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!message) return;

    mutation.mutate({ message });
    setMessage("");
  };

  return (
    <div className="comments">
      <div className="write">
        <img
          src={
            currentUser.photoURL ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZvmV2bdt-eITXhe_MeJMt4zKRHatRco1AgPedOFkdvQ&s"
          }
          alt=""
        />
        <input
          type="text"
          placeholder="write a comment"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleAddComment}>Send</button>
      </div>
      {commentsQuery.data?.map((comment) => (
        <div className="comment" key={comment?.id}>
          <img
            src={
              comment.photoURL ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZvmV2bdt-eITXhe_MeJMt4zKRHatRco1AgPedOFkdvQ&s"
            }
            alt=""
          />
          <div className="info">
            <span>{comment?.name}</span>
            <p>{comment?.message}</p>
          </div>
          <span className="date">{moment(comment.createdAt).fromNow()}</span>
        </div>
      ))}
    </div>
  );
};

export default Comments;
