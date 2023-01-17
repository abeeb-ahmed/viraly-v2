import "./share.scss";
import Image from "../../assets/img.png";
import Map from "../../assets/map.png";
import Friend from "../../assets/friend.png";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useContext, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { AuthContext } from "../../context/authContext";
import { db, storage } from "../../firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const Share = () => {
  const { currentUser } = useContext(AuthContext);

  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [img, setImg] = useState("");
  const [isLoading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  // send post to db using react query
  const mutation = useMutation(
    async (newPost) => {
      const id = uuidv4();
      const docRef = await addDoc(collection(db, "posts"), {
        id,
        message: newPost.desc,
        img: newPost.img,
        senderId: currentUser.uid,
        comments: [],
        likes: [],
        createdAt: serverTimestamp(),
      });

      const q = query(collection(db, "posts"), where("id", "==", id));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        return doc.data();
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["posts"]);
      },
    }
  );

  const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
      // Upload file and metadata
      const storageRef = ref(
        storage,
        "images/" + currentUser.name + Date.now()
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log(error);
          reject(error);
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            mutation.mutate({ desc, img: downloadURL });
            setFile(null);
            setImg("");
            setDesc("");
            setLoading(false);
          });
        }
      );
    });
  };

  const handlePost = async (e) => {
    e.preventDefault();

    if (!desc && !file) return;
    setLoading(true);

    file ? await uploadImage(file) : mutation.mutate({ desc, img });

    setLoading(false);

    setFile(null);
    setImg("");
    setDesc("");
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <img
            src={
              currentUser.photoURL ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZvmV2bdt-eITXhe_MeJMt4zKRHatRco1AgPedOFkdvQ&s"
            }
            alt=""
          />
          <div className="flex-row">
            <div className="left">
              <input
                type="text"
                placeholder={`What's on your mind ${currentUser.name}?`}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="right">
              {file !== null && <img src={URL.createObjectURL(file)} alt="" />}
            </div>
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file">
              <div className="item">
                <img src={Image} alt="" />
                <span>Add Image</span>
              </div>
            </label>
            <div className="item">
              <img src={Map} alt="" />
              <span>Add Place</span>
            </div>
            <div className="item">
              <img src={Friend} alt="" />
              <span>Tag Friends</span>
            </div>
          </div>
          <div className="right">
            <button disabled={isLoading} onClick={(e) => handlePost(e)}>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
