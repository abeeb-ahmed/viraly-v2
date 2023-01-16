import { collection, getDocs, query, where } from "firebase/firestore";
import { useContext } from "react";
import { useQuery } from "react-query";
import { AuthContext } from "../../context/authContext";
import { db } from "../../firebase";
import Post from "../post/Post";
import "./posts.scss";

const Posts = ({ userId = "" }) => {
  const { currentUser } = useContext(AuthContext);
  const { isLoading, error, data } = useQuery(["posts"], async () => {
    const posts = [];
    if (userId) {
      const q = query(collection(db, "posts"), where("senderId", "==", userId));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        posts.push(doc.data());
      });
    } else {
      const q = query(
        collection(db, "posts"),
        where("senderId", "in", [...currentUser.followings, currentUser.uid])
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        posts.push(doc.data());
      });
    }

    return posts;
  });
  return (
    <div className="posts">
      {error
        ? "Something went wrong"
        : isLoading
        ? "Loading..."
        : data?.map((post) => <Post post={post} key={post.id} />)}
    </div>
  );
};

export default Posts;
