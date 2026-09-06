import Images from "../../../assets/Images";

const HeaderLogo = () => {
    return (
        <div className="flex items-center justify-center w-auto font-poppins">
            <img className="w-20" src={Images.title_logo1}/>
            <span 
                className="font-bold text-blue-50 text-3xl"
            >MU VOID 
            <span className="ml-2.5">Forum</span>
            </span>
        </div>
    );
}

export default HeaderLogo;
