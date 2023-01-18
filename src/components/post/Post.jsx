import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import moment from "moment";
import Comments from "../comments/Comments";
import { useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../context/authContext";

const Post = ({ post }) => {
  const { currentUser } = useContext(AuthContext);
  const [commentOpen, setCommentOpen] = useState(false);
  const [postDocId, setPostDocId] = useState("");
  const [user, setUser] = useState({});

  useEffect(() => {
    const getUser = async () => {
      const q = query(
        collection(db, "users"),
        where("uid", "==", post.senderId)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUser(doc.data());
      });
    };

    getUser();
  }, [post.senderId]);

  const queryClient = useQueryClient();

  const commentsQuery = useQuery(["comments", post.id], async () => {
    let comments = [];
    const q = query(collection(db, "posts"), where("id", "==", post.id));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setPostDocId(doc.id);
      comments.push(doc.data().comments);
    });

    return comments[0];
  });

  const likesQuery = useQuery(["likes", post.id], async () => {
    let likes = [];
    const q = query(collection(db, "posts"), where("id", "==", post.id));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      likes.push(doc.data());
    });
    return likes[0]?.likes;
  });

  // send post to db using react query
  const mutation = useMutation(
    async (liked) => {
      let likes = [];
      if (liked) {
        const docRef = doc(db, "posts", postDocId);

        // Atomically remove a region from the "likes" array field.
        await updateDoc(docRef, {
          likes: arrayRemove(currentUser.uid),
        });

        const q = query(collection(db, "posts"), where("id", "==", post.id));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          likes.push(doc.data());
        });
        return likes;
      } else {
        const docRef = doc(db, "posts", postDocId);

        // Atomically remove a region from the "likes" array field.
        await updateDoc(docRef, {
          likes: arrayUnion(currentUser.uid),
        });

        const q = query(collection(db, "posts"), where("id", "==", post.id));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          likes.push(doc.data());
        });
        return likes;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["likes"]);
      },
    }
  );
  const handleLike = () => {
    mutation.mutate(likesQuery.data?.includes(currentUser.uid));
  };

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img
              src={
                user?.photoURL ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZvmV2bdt-eITXhe_MeJMt4zKRHatRco1AgPedOFkdvQ&s"
              }
              alt=""
            />
            <div className="details">
              <Link
                to={`/profile/${post.senderId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{user?.name}</span>
              </Link>
              <span className="date">
                {moment(post.createdAt?.toMillis()).fromNow()}
              </span>{" "}
            </div>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="content">
          <p>{post.message}</p>
          <img src={post.img} alt="" />
        </div>
        <div className="info">
          <div className="item">
            {likesQuery.isLoading ? (
              "Loading..."
            ) : likesQuery.data?.includes(currentUser.uid) ? (
              <FavoriteOutlinedIcon
                style={{ color: "red" }}
                onClick={handleLike}
              />
            ) : (
              <FavoriteBorderOutlinedIcon onClick={handleLike} />
            )}
            {likesQuery.data?.length} Likes
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {commentsQuery.data?.length} Comments
          </div>
          <div className="item">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>
        {commentOpen && <Comments postId={post.id} />}
      </div>
    </div>
  );
};

export default Post;
