import Image from "next/image";

function Icon({ onClick, src, alt, className }) {
    return (
        <Image
            src={src}
            alt={alt}
            onClick={onClick}
            className={className}
        ></Image>
    );
}

export { Icon };
