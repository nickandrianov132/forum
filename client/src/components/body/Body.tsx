import { useState } from "react";
import LoginForm from "../header/userPanel/LoginForm.tsx";
import LeftNavbar from "../leftNavbar/LeftNavbar";
import RightSideBar from "../rightSidebar/RightSideBar";
import AppRouter from "./AppRouter";

const Body = () => {
    const [isHidden, setIsHidden] = useState(false);
    return (
        <main className="main">
          <LeftNavbar />
          <AppRouter/>
          <RightSideBar/>
          {!isHidden && <LoginForm />}
          
        </main>
    );
}

export default Body;
