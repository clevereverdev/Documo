import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, where, query } from "firebase/firestore";
import { app } from "../firebase/firebase";
import Layout from "@/Sidebar";
import { IoImages, IoLockClosed } from "react-icons/io5"; // Import lock icon from IoIcons
import PasswordModal from "@/File/PasswordModal";
import { useAuth } from "../firebase/auth";

// Allowed image file types
const imageTypes = ['png', 'jpg', 'jpeg', 'webp', 'heic'];

const Photos = () => {
  const [items, setItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const db = getFirestore(app);
  const { authUser } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      if (authUser && authUser.email) {
        const itemsRef = collection(db, "files");
        const querySnapshot = await getDocs(query(itemsRef, where("createdBy", '==', authUser.email)));
      const fetchedItems = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const modifiedAt = data.modifiedAt?.toDate ? data.modifiedAt.toDate() : new Date();
        const sensitive = data.sensitive ?? false; // Default to non-sensitive if field is missing
        return { id: doc.id, ...data, modifiedAt, sensitive };
      }).filter(item => imageTypes.includes(item.type));
      setItems(fetchedItems);
    }
    };
// Call fetchItems only if authUser exists
if (authUser) {
  fetchItems();
}
    fetchItems();
  }, [db, authUser]);

  useEffect(() => {
    // Group items by year and month
    const grouped = items.reduce((acc, item) => {
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = item.modifiedAt.toLocaleDateString('default', dateOptions);
      const key = formattedDate;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(item);
      return acc;
    }, {});

    setGroupedItems(grouped);
  }, [items]);

  // Function to handle image click
  const handleImageClick = (event, item) => {
    event.preventDefault(); // Prevent the default action
  
    if (item.sensitive) {
      setSelectedImage(item);
      setShowPasswordModal(true);
    } else {
      window.open(item.imageUrl, '_blank');
    }
  };
  

  // Function to call after submitting the password
  const onPasswordSubmit = (password) => {
    // Here you should verify the password
    // If the password is correct, open the image in a new tab
    if (password === selectedImage.password) {
      setShowPasswordModal(false);
      window.open(selectedImage.imageUrl, '_blank');
    } else {
      // If the password is incorrect, you can set an error message
      // This logic should be handled within the PasswordModal component
    }
  };

  return (
    <Layout>
    <div className="container mx-auto p-6 min-h-[96vh] mb-[7px] overflow-auto">
        <div className='flex items-center justify-center bg-[#292929] w-full h-[200px] rounded-lg p-4'>
          <IoImages className='text-[#3EA88B] text-[100px]'/>
          <h1 className="text-5xl font-extrabold text-gray-300 mx-5">Image Gallery</h1>
        </div>

        {Object.keys(groupedItems).sort().reverse().map((date) => (
          <div key={date}>
            <h2>
              <span className='text-2xl font-bold text-gray-400 font-Payton'>{date}</span> • <span className='text-lg text-gray-400'>({groupedItems[date].length} images)</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 my-4">
            {groupedItems[date].map((item) => (
  <div key={item.id} className="group relative aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-full bg-[#292929] p-5 hover:scale-110 transition-transform duration-300 ease-in-out">
    <button onClick={(event) => handleImageClick(event, item)} className="block w-full h-full focus:outline-none">
      <img
        className="object-cover h-full w-full"
        src={item.imageUrl}
        alt={item.name}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
        <span className="text-white text-center font-bold">{item.name}</span>
      </div>
      {item.sensitive && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-90">
          <IoLockClosed className="text-[#3EA88B] text-[100px]" />
        </div>
      )}
    </button>
  </div>
))}
            </div>
          </div>
        ))}
      </div>
        {showPasswordModal && selectedImage && (
<PasswordModal
show={showPasswordModal}
onClose={() => setShowPasswordModal(false)}
onSubmit={onPasswordSubmit}
isUnlocking={true}
file={selectedImage} // Pass the selected image as a prop
/>
)}
    </Layout>
  );
};

export default Photos;
