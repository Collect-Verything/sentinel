import { TASKS_PATH } from "../../common/utils/web/const";

export const Tasks = () => {
    async function startTask() {
        const res = await fetch(`http://localhost:3001/${TASKS_PATH}/enqueue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seconds: 20 }),
        });
        const { id } = await res.json();

        const interval = setInterval(async () => {
            const s = await fetch(`http://localhost:3001/${TASKS_PATH}/status/${id}`)
                .then(r => r.json());

            console.log('status', s);

            if (s.state === 'completed' || s.state === 'failed' || s.error === 'not_found') {
                clearInterval(interval);
            }
        }, 1000);
    }

    return (
        <>
            <p>Task page</p>
            <button onClick={startTask}>Lancer la tâche</button>
        </>
    );
};
