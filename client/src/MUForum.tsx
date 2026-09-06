
import { BrowserRouter } from 'react-router';
import Body from './components/body/Body';
import Footer from './components/footer/Footer';
import Header from './components/header/Header';
const MUForum = () => {
    return (
        <BrowserRouter>
            <div className="forum_container">
                <Header />
                <Body />
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default MUForum;
