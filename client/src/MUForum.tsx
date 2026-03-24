
import { BrowserRouter } from 'react-router';
import NavBar from './components/navbar/NavBar';
import Body from './components/body/Body';
import Footer from './components/footer/Footer';
const MUForum = () => {
    return (
        <BrowserRouter>
            <div className="forum_container">
                <NavBar />
                <Body />
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default MUForum;
