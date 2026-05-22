import React,{useEffect,useState} from "react";
import axios from "axios";

function Certificates(){

    const [certificates,setCertificates]=useState([]);

    useEffect(()=>{

        loadCertificates();

    },[]);

    const loadCertificates=async()=>{

        try{

            const response=await axios.get(
                "/api/certificates/my-certificates/"
            );

            setCertificates(response.data);

        }

        catch(error){

            console.log(error);

        }

    }

    return(

        <div className="p-4">

            <h1>My Certificates</h1>

            {certificates.length===0 ?(

                <p>No certificates earned yet.</p>

            ):(

                certificates.map(cert=>(

                    <div
                        key={cert.id}
                        className="border p-4 rounded mb-3"
                    >

                        <h3>
                            {cert.level} Certificate
                        </h3>

                        <p>
                            Issued:
                            {" "}
                            {new Date(
                                cert.issued_at
                            ).toLocaleDateString()}
                        </p>

                        <button
                            onClick={()=>{

                                window.open(
                                `/api/certificates/download/${cert.id}/`
                                )

                            }}
                        >

                            Download PDF

                        </button>

                    </div>

                ))

            )}

        </div>

    )

}

export default Certificates;