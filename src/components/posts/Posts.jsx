import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import moment from "moment/moment";
import { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { AuthContext } from "../../context/authContext";
import { db } from "../../firebase";
import Post from "../post/Post";
import "./posts.scss";

const Posts = ({ userId = "" }) => {
  const { currentUser } = useContext(AuthContext);

  const { isLoading, error, data } = useQuery(["posts"], async () => {
    const posts = [];

    if (userId !== "") {
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
        doc.data().createdAt = doc.data().createdAt.toMillis();

        posts.push(doc.data());
      });
    }

    const sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);

    return sortedPosts;
  });

  return (
    <div className="posts">
      {error
        ? "Something went wrong"
        : isLoading
        ? "Loading..."
        : data?.reverse().map((post) => <Post post={post} key={post.id} />)}
    </div>
  );
};

export default Posts;
