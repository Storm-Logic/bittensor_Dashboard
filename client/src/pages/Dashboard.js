import { useCallback, useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {

    const [netuid, setNetuid] = useState(1);
    const [loading, setLoading] = useState(false);
    const [neurons, setNeurons] = useState([]);
    const [subData, setSubData] = useState(null);
    const [adding, setAdding] = useState([]);
    const [error, setError] = useState("");

    const add = async () => {
        try {
            const res = await axios.post("http://localhost:8000/add", {

                a: 1,
                b: "sample",
                c: 2.0,
                d: 3.0,
                e: 4.0,

            });
            setAdding(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.log(err);
        }
    };
    const loadSubnet = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const res = await axios.get(
                `http://localhost:8000/subnet/${netuid}`
            );

            setSubData(res.data);

            setNeurons(res.data.neurons || []);

        } catch (err) {

            setError(err.response?.data?.detail || err.message || "Failed to load subnet");
            console.log(err);

        } finally {

            setLoading(false);

        }
    }, [netuid]);

    useEffect(() => {
        loadSubnet();
    }, [loadSubnet]);

    return (
        <div style={{
            background: "#111",
            color: "white",
            minHeight: "100vh",
            padding: 20,
            fontFamily: "Arial"
        }}>

            <h1>Bittensor Dashboard</h1>

            <div style={{ marginBottom: 20 }}>

                <input
                    type="number"
                    value={netuid}
                    onChange={(e) => setNetuid(e.target.value)}
                    style={{
                        padding: 10,
                        marginRight: 10,
                        width: 100
                    }}
                />

                <button
                    onClick={loadSubnet}
                    style={{
                        padding: 10,
                        cursor: "pointer"
                    }}
                >
                    Load
                </button>

            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "#ff8080" }}>{error}</p>}

            <div>
                <div>{`Price: ${subData?.price?.toFixed(6) || 0}`}</div>
                <div>{`Tao in pool: ${subData?.tao_in?.toFixed(4) || 0}`}</div>
                <div>{`Alpha in pool: ${subData?.alpha_in?.toFixed(4) || 0}`}</div>
                <div>{`Tao Price: ${subData?.tao_price || 0}`}</div>
                <div>{`Emission: ${subData?.emission?.toFixed(4) || 0}`}</div>
                <div>{`Incentive burn: ${subData?.Incentive_burn?.toFixed(4) || 0}`}</div>
                <div>{`Num_validator: ${subData?.num_val || 0}`}</div>
            </div>

            <table
                border="1"
                cellPadding="10"
                style={{
                    borderCollapse: "collapse",
                    width: "100%"
                }}
            >
                <thead>
                    <tr>
                        <th>UID</th>
                        <th>Role</th>
                        <th>Stake</th>
                        {/* <th>Trust</th> */}
                        <th>Consensus</th>
                        <th>Emission</th>
                        <th>Hotkey</th>
                    </tr>
                </thead>

                <tbody>

                    {neurons.map((n) => (

                        <tr key={n.uid}>

                            <td>{n.uid}</td>

                            <td>
                                {n.validator ? "Validator" : "Miner"}
                            </td>

                            <td>
                                {Number(n.stake || 0).toFixed(4)}
                            </td>

                            {/* <td>
                                {n.trust.toFixed(4)}
                            </td> */}

                            <td>
                                {Number(n.consensus || 0).toFixed(4)}
                            </td>

                            <td>
                                {Number(n.emission || 0).toFixed(4)}
                            </td>

                            <td
                                style={{
                                    maxWidth: 300,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {n.hotkey}
                            </td>

                        </tr>

                    ))}

                </tbody>
            </table>

            <div>adding</div><button onClick={add}>add</button>

            <table
                border="1"
                cellPadding="10"
                style={{
                    borderCollapse: "collapse",
                    width: "100%"
                }}
            >
                <thead>
                    <tr>
                        <th>a</th>
                        <th>b</th>
                        <th>c</th>
                        <th>d</th>
                        <th>d</th>
                    </tr>
                </thead>

                <tbody>

                    {adding.map((n, index) => (

                        <tr key={`${n.a}-${index}`}>

                            <td>{n.a}</td>

                            <td>
                                {n.b}
                            </td>

                            <td>
                                {Number(n.c || 0).toFixed(4)}
                            </td>

                            {/* <td>
                                {n.trust.toFixed(4)}
                            </td> */}

                            <td>
                                {Number(n.d || 0).toFixed(4)}
                            </td>

                            <td>
                                {Number(n.e || 0).toFixed(4)}
                            </td>


                        </tr>

                    ))}

                </tbody>
            </table>

        </div>
    );
}
