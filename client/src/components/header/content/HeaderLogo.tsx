import Images from "../../../assets/Images";

const HeaderLogo = () => {
    return (
        <div className="flex items-center justify-center w-auto font-poppins">
            <img className="w-46 sm:w-68" src={Images.void_logo}/>
            {/* <img className="w-14 sm:w-24 object-contain transition-transform duration-300 hover:scale-102 animate-[voidPulse_3s_ease-in-out_infinite]" src={Images.void_fav}/> */}
            <span 
                className="hidden font-bold text-blue-50 text-xl sm:text-3xl"
            >MU Online 
            <span className="ml-2.5">Forum</span>
            </span>
        </div>
    );
}

export default HeaderLogo;
