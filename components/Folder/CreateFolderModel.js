import { app } from '../../firebase/firebase';
import React, { useContext, useState } from 'react'
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { useAuth } from "../../firebase/auth";
import { ShowToastContext } from 'context/ShowToastContext';

function CreateFolderModel() {
    const [folderName, setfolderName] = useState();
    const {showToastMsg,setShowToastMsg}=useContext(ShowToastContext)
    const docId = Date.now().toString();
    const { authUser } = useAuth();
    const db = getFirestore(app)

    const onCreate = async () => {
        console.log(folderName);
        await setDoc(doc(db, "Folders", docId), {
            Name: folderName,
            ID: docId,
            CreatedBy: authUser.email,
            Username: authUser.username
          });
          setShowToastMsg('Folder Created successfully!')
    }
    return (
        <div>
            <form method="dialog">
                <button className="btn-circle btn-ghost absolute right-2 top-2">✕</button>
                <div className="w-full items-center flex flex-col justify-center gap-3">
                    <img src="/folder.png" alt="folder" width={50} height={50} />
                    <input
                        type="text"
                        placeholder="Folder Name"
                        className="p-2 border-[1px] outline-none rounded-md w-full"
                        onChange={(e) => setfolderName(e.target.value)}/>
                    <button className="bg-blue-500 text-white rounded-md p-2 px-3 w-full" onClick={() => onCreate()}>Create</button>
                </div>
            </form>
        </div>
    )
}

export default CreateFolderModel