import Images from "../../../assets/Images";

const HeaderLogo = () => {
    return (
        <div className="flex items-center justify-center w-auto font-poppins">
            <img className="w-16 sm:w-20" src={Images.title_logo1}/>
            <span 
                className="hidden font-bold text-blue-50 text-xl sm:text-3xl"
            >MU Online 
            <span className="ml-2.5">Forum</span>
            </span>
        </div>
    );
}

export default HeaderLogo;
