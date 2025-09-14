import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout/Layout";
import Home from "./pages/HomePage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Membership from "./pages/Membership";
import Branches from "./pages/Branches";
import Login from "./pages/LoginPage";
import Profile from "./pages/profile";
import AllCommittees from "./pages/AllCommittees";
import BranchDetail from "./pages/BranchDetail";
import {
  CentralBranch,
  Province1Branch,
  MadheshBranch,
  GandakiBranch,
  LumbiniBranch,
  KarnaliBranch,
  SudurpashchimBranch,
} from "./pages/branches/index.js";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aboutus" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/branches/central" element={<CentralBranch />} />
          <Route path="/branches/province1" element={<Province1Branch />} />
          <Route path="/branches/madhesh" element={<MadheshBranch />} />
          <Route path="/branches/gandaki" element={<GandakiBranch />} />
          <Route path="/branches/lumbini" element={<LumbiniBranch />} />
          <Route path="/branches/karnali" element={<KarnaliBranch />} />
          <Route path="/branches/sudurpashchim" element={<SudurpashchimBranch />} />
          {/* Legacy route for old dynamic branch detail */}
          <Route path="/branch" element={<Branches />} />
          <Route path="/branch/:branchName" element={<BranchDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/committees" element={<AllCommittees />} />
        </Routes>
      </Layout>
      <ToastContainer />
    </Router>
  );
}

export default App;
