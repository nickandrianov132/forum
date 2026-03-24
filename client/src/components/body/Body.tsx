import LeftSideBar from "../leftSidebar/LeftSideBar";
import RightSideBar from "../rightSidebar/RightSideBar";
import AppRouter from "./AppRouter";

const Body = () => {
    return (
        <div className="body">
          <LeftSideBar/>
          <AppRouter/>
          <RightSideBar/>
        </div>
    );
}

export default Body;
