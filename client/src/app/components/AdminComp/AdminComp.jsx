import { check } from "@/app/http/userAPI";

export async function getServerSideProps(context) {
    try {
        const { user } = await check();

        if (!user) {
            return {
                redirect: {
                    destination: "/login",
                    permanent: false,
                },
            };
        }

        return {
            props: { user },
        };
    } catch {
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }
}

const AdminPage = ({ user }) => {
    return <div>Welcome, {user.name}!</div>;
};

export default AdminPage;
