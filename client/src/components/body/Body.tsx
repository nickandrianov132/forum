
import LeftNavbar from "../leftNavbar/LeftNavbar";
import RightSideBar from "../rightSidebar/RightSideBar";
import AppRouter from "./AppRouter";

const Body = () => {

    return (
        <main className="main">
          <LeftNavbar />
          <AppRouter/>
          <RightSideBar/>
        </main>
    );
}

export default Body;
