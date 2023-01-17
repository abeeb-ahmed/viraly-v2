import { collection, addDoc } from "firebase/firestore";
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { AuthContext } from "../../context/authContext";

import "./register.scss";
import { auth, db } from "../../firebase";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) navigate("/");
  }, [currentUser, navigate]);

  const handleClick = async (e) => {
    if (!username || !email || !name || !password) return;
    e.preventDefault();
    setLoading(true);

    // register user with firebase
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // add user to users db
        addDoc(collection(db, "users"), {
          uid: user.uid,
          username,
          email,
          name,
          followers: [],
          followings: [],
          photoURL: "",
          posts: [],
          website: "",
          city: "",
        });

        navigate("/login");
      })
      .catch((error) => {
        const errorMessage = error.message;
        setError(errorMessage);
        // ..
      });

    setLoading(false);
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Viraly</h1>
          <p>
            Connect to the world on Viraly. Get updates, and keep in touch with
            your family and friends.
          </p>
          <span>Do you have an account?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form>
            <input
              required
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              placeholder="Username"
            />
            <input
              required
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Email"
            />
            <input
              required
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Password"
            />
            <input
              required
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Name"
            />
            <button onClick={handleClick} disabled={loading}>
              Register
            </button>
            <span className="mobile">
              Already have an account?
              <Link to="/login" style={{ textDecoration: "none" }}>
                <span> Login</span>
              </Link>
            </span>
            {error && error}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
