import Image from "next/image";

function Icon({ onClick, src, alt }) {
    return <Image src={src} alt={alt} onClick={onClick}></Image>;
}

export default Icon;
