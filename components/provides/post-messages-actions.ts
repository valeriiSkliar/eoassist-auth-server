import { usePostMessages } from "./postMessage-provider";

const { setIsLoading } = usePostMessages();


export const afterParentResiveMessage = (e: MessageEvent) => {
    const {action, key, value} = e.data;
    if (action === 'startAnswer') {
        setIsLoading(true)
    }

}