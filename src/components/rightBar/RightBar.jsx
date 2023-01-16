import { useQuery } from "react-query";
import "./rightBar.scss";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const Rightbar = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const featuredUsersQuery = useQuery(["featuredUsers"], async () => {
    const users = [];
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return users;
  });

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>
          {featuredUsersQuery.data?.map((user) => {
            if (user.uid === currentUser.uid) {
              return;
            } else {
              return (
                <div className="user" key={user.uid}>
                  <div className="userInfo">
                    <img
                      src={
                        user.profilePic ||
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZvmV2bdt-eITXhe_MeJMt4zKRHatRco1AgPedOFkdvQ&s"
                      }
                      alt=""
                    />
                    <span>{user.name}</span>
                  </div>
                  <div className="buttons">
                    <button onClick={() => navigate(`/profile/${user.uid}`)}>
                      View Profile
                    </button>
                  </div>
                </div>
              );
            }
          })}
        </div>
        {/*  RECENT ACTIVITY AND ONLINE FRIENDS TO BE DONE LATER */}
        {/* <div className="item">
          <span>Latest Activities</span>
          <div className="user">
            <div className="userInfo">
              <img
                src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt=""
              />
              <p>
                <span>Jane Doe</span> changed their cover picture
              </p>
            </div>
            <span>1 min ago</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Rightbar;
