
import { BrowserRouter } from 'react-router';
import Body from './components/body/Body';
import Footer from './components/footer/Footer';
import Header from './components/header/Header';
const MUForum = () => {
    return (
        <BrowserRouter>
            <div className="flex flex-col w-full min-h-dvh bg-linear-to-tl from-[#2C353F] via-[#253342] to-[#334155]">
                <Header />
                <Body />
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default MUForum;
