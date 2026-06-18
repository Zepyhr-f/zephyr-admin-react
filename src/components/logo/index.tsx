import { NavLink } from "react-router";

interface Props {
    size?: number;
    className?: string;
}

function Logo({ size = 28, className }: Props) {
    return (
        <NavLink to="/" className={className}>
            <img src="/logo.svg" alt="logo" width={size} height={size} />
        </NavLink>
    );
}

export default Logo;
