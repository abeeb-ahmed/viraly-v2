import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import "./login.scss";
import { AuthContext } from "../../context/authContext";
import { auth, db } from "../../firebase";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, currentUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    let user;
    if (!email || !password) return;
    setLoading(true);
    // sign in user

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const q = query(
          collection(db, "users"),
          where("uid", "==", userCredential.user.uid)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          user = doc.data();
        });
        login(user);
        currentUser && navigate("/");
      })
      .catch((error) => {
        const errorMessage = error.message;
        setError(errorMessage);
      });
    setLoading(false);
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Hello World.</h1>
          <p>
            Connect to the world on Viraly. Get updates, and keep in touch with
            your family and friends.
          </p>
          <span>Don't you have an account?</span>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
        <div className="right">
          <h1>Login</h1>
          <form>
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin} disabled={loading}>
              Login
            </button>
            <span className="mobile">
              Don't have an account?
              <Link to="/register" style={{ textDecoration: "none" }}>
                <span> Register</span>
              </Link>
            </span>
            {error && error}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
