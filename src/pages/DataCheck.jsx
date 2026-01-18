import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const DataCheck = () => {
    const [reps, setReps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkData = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'representatives'));
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name,
                    accessCode: doc.data().accessCode
                }));
                setReps(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        checkData();
    }, []);

    return (
        <div className="p-8 text-white min-h-screen bg-black">
            <h1 className="text-2xl font-bold mb-4">Database Check</h1>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && (
                <div className="space-y-4">
                    <p className="text-green-400">Found {reps.length} Representatives</p>
                    <div className="grid gap-2">
                        {reps.map(rep => (
                            <div key={rep.id} className="p-2 border border-white/20 rounded">
                                <p>Name: {rep.name}</p>
                                <p className="font-mono text-yellow-400">Code: {rep.accessCode}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
