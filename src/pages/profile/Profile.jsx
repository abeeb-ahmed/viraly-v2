import "./profile.scss";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import Posts from "../../components/posts/Posts";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update";
import {
  arrayRemove,
  arrayUnion,
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [updateOpen, setUpdateOpen] = useState(false);
  const location = useLocation();
  const userId = location.pathname.split("/")[2];
  const [userDocId, setUserDocId] = useState("");
  const [currentUserDocId, setCurrentUserDocId] = useState("");

  const queryClient = useQueryClient();

  const userQuery = useQuery(["userProfile", userId], async () => {
    let user;
    const q = query(collection(db, "users"), where("uid", "==", userId));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      user = doc.data();
      setUserDocId(doc.id);
    });

    return user;
  });

  const relationshipsQuery = useQuery(["relationships", userId], async () => {
    let followers;
    const q = query(collection(db, "users"), where("uid", "==", userId));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      followers = doc.data().followers;
    });
    return followers;
  });

  const currentUserQuery = useQuery(
    ["currentUser", currentUser.uid],
    async () => {
      const q = query(
        collection(db, "users"),
        where("uid", "==", currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        setCurrentUserDocId(doc.id);
      });
    }
  );

  // post request to follow
  const followMutation = useMutation(
    async () => {
      let followers = [];

      const docRef = doc(db, "users", userDocId);

      // Atomically add a region from the "followings" array field.
      await updateDoc(docRef, {
        followers: arrayUnion(currentUser.uid),
      });

      const q = query(collection(db, "users"), where("id", "==", userId));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        followers.push(doc.data());
      });

      // add new user in other user
      const docRef2 = doc(db, "users", currentUserDocId);

      await updateDoc(docRef2, {
        followings: arrayUnion(userId),
      });
      return followers;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["relationships"]);
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  // delete request to unfollow
  const unfollowMutation = useMutation(
    async () => {
      let followers = [];

      const docRef = doc(db, "users", userDocId);

      // Atomically remove a region from the "likes" array field.
      await updateDoc(docRef, {
        followers: arrayRemove(currentUser.uid),
      });

      const docRef2 = doc(db, "users", currentUserDocId);

      // Atomically remove a region from the "likes" array field.
      await updateDoc(docRef2, {
        followings: arrayRemove(userId),
      });

      const q = query(collection(db, "users"), where("id", "==", userId));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        followers.push(doc.data());
      });
      return followers;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["relationships"]);
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  // handle follow and unfollow
  const handleFollow = () => {
    relationshipsQuery.data?.includes(currentUser.uid)
      ? unfollowMutation.mutate()
      : followMutation.mutate();
  };

  return (
    <div className="profile">
      {userQuery.isLoading || relationshipsQuery.isLoading ? (
        "Loading..."
      ) : (
        <>
          <div className="images">
            <img
              src={
                userQuery.data?.coverPic ||
                "https://images.pexels.com/photos/13440765/pexels-photo-13440765.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              }
              alt=""
              className="cover"
            />
            <img
              src={
                userQuery.data?.photoURL ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZvmV2bdt-eITXhe_MeJMt4zKRHatRco1AgPedOFkdvQ&s"
              }
              alt=""
              className="profilePic"
            />
          </div>
          <div className="profileContainer">
            <div className="uInfo">
              <div className="center">
                <span>{userQuery.data?.name}</span>
                <div className="info">
                  <div className="item">
                    <PlaceIcon />
                    <span>{userQuery.data?.city}</span>
                  </div>
                  <div className="item">
                    <LanguageIcon />
                    <span>{userQuery.data?.website}</span>
                  </div>
                </div>
                {currentUser.uid === userQuery.data?.uid ? (
                  <button onClick={() => setUpdateOpen(true)}>Update</button>
                ) : (
                  <button onClick={handleFollow}>
                    {relationshipsQuery.data?.includes(currentUser.uid)
                      ? "Unfollow"
                      : "follow"}
                  </button>
                )}
              </div>
            </div>
            <Posts userId={userId} />
          </div>
          {updateOpen && <Update setUpdateOpen={setUpdateOpen} />}
        </>
      )}
    </div>
  );
};

export default Profile;
