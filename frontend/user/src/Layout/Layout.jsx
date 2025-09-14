import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}


export default Layout;
