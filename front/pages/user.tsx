import { getSession } from 'next-auth/react';

function User({ user }) {
    return (
        <div>
            <h4>User session:</h4>
            <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await getSession(context);

    // redirect if not authenticated
    if (!session) {
        return {
            redirect: {
                destination: '/user',
                permanent: false,
            },
        };
    }

    return {
        props: { user: session.user },
    };
}

export default User;