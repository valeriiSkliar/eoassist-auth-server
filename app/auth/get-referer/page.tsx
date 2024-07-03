import { headers } from "next/headers"

const GetReferer = () => {

    return (
        <div>
            <h1>Get Referer</h1>
            <pre>
                {JSON.stringify(headers().get('referer'), null, 2)}
            </pre>
        </div>
    )
}

export default GetReferer