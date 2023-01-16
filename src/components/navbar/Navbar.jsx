import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { useState } from "react";
import { useQuery } from "react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const Navbar = () => {
  const [navOpen, setNavOpen] = useState(false);
  const { toggleMode, darkMode } = useContext(DarkModeContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const featuredUsersQuery = useQuery(["featuredUsers"], async () => {
    const users = [];
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return users;
  });

  const handleSignout = () => {
    setNavOpen(false);
    logout();
  };

  const handleProfileView = (id) => {
    setNavOpen(false);
    navigate(`/profile/${id}`);
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span>Viraly</span>
        </Link>
        <div className="icons">
          <HomeOutlinedIcon className="icon" onClick={() => navigate("/")} />

          {darkMode ? (
            <WbSunnyOutlinedIcon className="icon" onClick={toggleMode} />
          ) : (
            <DarkModeOutlinedIcon className="icon" onClick={toggleMode} />
          )}
          <LogoutIcon className="icon laptop" onClick={handleSignout} />

          <GridViewOutlinedIcon
            className="icon mobile"
            onClick={() => setNavOpen(true)}
          />
        </div>
        <div className="search">
          <SearchOutlinedIcon />
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <div className="right">
        <PersonOutlinedIcon className="icon" />
        <EmailOutlinedIcon className="icon" />
        <NotificationsOutlinedIcon className="icon" />
        <Link
          to={`/profile/${currentUser.uid}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="user">
            <img
              src={
                currentUser.photoURL ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZvmV2bdt-eITXhe_MeJMt4zKRHatRco1AgPedOFkdvQ&s"
              }
              alt=""
            />
            <span>{currentUser.name}</span>
          </div>
        </Link>
      </div>
      {navOpen && (
        <div className="layer" onClick={() => setNavOpen(false)}></div>
      )}
      <div className={`mobileNav ${navOpen ? "open" : ""}`}>
        <CloseIcon className="icon" onClick={() => setNavOpen(false)} />
        <div className="top">
          <Link
            onClick={() => setNavOpen(false)}
            to={`/profile/${currentUser.uid}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="user">
              <img
                src={
                  currentUser.photoURL ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZvmV2bdt-eITXhe_MeJMt4zKRHatRco1AgPedOFkdvQ&s"
                }
                alt=""
              />
              <span>{currentUser.name}</span>
            </div>
          </Link>
          <div className="buttons">
            <button onClick={handleSignout}>Sign Out</button>
          </div>
        </div>
        <div className="middle">
          <span>Suggestions For You</span>
          {featuredUsersQuery.data?.map((user) => {
            if (user.id === currentUser.id) {
              return;
            } else {
              return (
                <div className="user">
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
                    <button onClick={() => handleProfileView(user.id)}>
                      View Profile
                    </button>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
