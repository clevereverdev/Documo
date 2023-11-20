import React, { useState, useEffect, useMemo } from 'react';
import { doc, getFirestore, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from "../../firebase/auth"; // Import your useAuth hook
import useStorageData from './StorageData'; // Ensure this hook is implemented correctly
import StoragePlans from './StoragePlans';
import { app } from '../../firebase/firebase'; // Correct path to your firebase config

const StorageView = () => {
  const { authUser } = useAuth();
  const { documents, images, archives, music, others } = useStorageData();
  const [totalStorageGivenBytes, setTotalStorageGivenBytes] = useState(1024 * 1024); // 1MB by default
  const [path, setPath] = useState('/');
  const db = getFirestore(app);
  const [showStoragePlans, setShowStoragePlans] = useState(false);


  const fetchUserStorageData = async () => {
    if (authUser?.username) {
      const userDocRef = doc(db, 'users', authUser.username);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setTotalStorageGivenBytes(userData.storageLimit || (1 * 1024 * 1024)); // 1MB default
      } else {
        // Create a new document for the user with initial storage
        await setDoc(userDocRef, {
          email: authUser.email,
          storageLimit: 1 * 1024 * 1024 // 1MB in bytes
        });
        setTotalStorageGivenBytes(1 * 1024 * 1024);
      }
    } else {
      console.error('The user does not have a username set in authUser.');
    }
  };


  useEffect(() => {
    fetchUserStorageData();
  }, []);

  const purchaseAdditionalStorage = async (additionalBytes) => {
    if (authUser?.username) {
      const userDocRef = doc(db, 'users', authUser.username);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const currentStorageLimit = docSnap.data().storageLimit || (1 * 1024 * 1024);
        const newTotalBytes = currentStorageLimit + additionalBytes;

        await updateDoc(userDocRef, {
          storageLimit: newTotalBytes
        });

        setTotalStorageGivenBytes(newTotalBytes);
      } else {
        console.error("No such user document!");
      }
    } else {
      console.error('The user does not have a username set in authUser.');
    }
  };


  // // Calculate total used storage bytes
  // const totalUsedStorageBytes = useMemo(() => {
  //   const allFiles = [...documents, ...images, ...archives, ...music, ...others, ...uncategorized];
  //   return allFiles.reduce((sum, file) => sum + file.size, 0);
  // }, [documents, images, archives, music, others, uncategorized]);


  // const handleUpgradeClick = () => {
  //   setPath('/plans'); // Set the path to simulate navigation
  //   window.history.pushState({}, '', '/plans'); // Update the URL without navigating
  // };
  const getPercentageColor = (percentage) => {
    if (percentage <= 50) {
      return '#4CAF50'; // Green color code
    } else if (percentage <= 75) {
      return '#FF9800'; // Orange color code
    } else {
      return '#F44336'; // Red color code
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleClosePlans = () => {
    setShowStoragePlans(false); // Assuming you have a state `showStoragePlans` controlling the visibility
  };

  // Calculate total used storage bytes and percentages
  const totalUsedStorageBytes = useMemo(() => {
    return [...documents, ...images, ...archives, ...music, ...others].reduce((sum, file) => sum + file.size, 0);
  }, [documents, images, archives, music, others]);

  const storageLeftBytes = totalStorageGivenBytes - totalUsedStorageBytes;

  const totalUsedStorageFormatted = formatBytes(totalUsedStorageBytes);
  const totalStorageGivenFormatted = formatBytes(totalStorageGivenBytes);
  const storageLeftFormatted = formatBytes(storageLeftBytes);

  const usedStoragePercentage = (totalUsedStorageBytes / totalStorageGivenBytes) * 100;
  const unusedStoragePercentage = 100 - usedStoragePercentage;


  // Convert polar coordinates to cartesian for the SVG arc path
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Describe the arc path for SVG
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };


  const strokeWidth = 40;
  const radius = 100;
  const circumference = Math.PI * radius;

  // const usedStoragePercentage = totalStorageGivenBytes > 0 ? (totalUsedStorageBytes / totalStorageGivenBytes) * 100 : 0;
  const documentPercentage = (documents.reduce((sum, file) => sum + file.size, 0) / totalStorageGivenBytes) * 100;
  const imagePercentage = (images.reduce((sum, file) => sum + file.size, 0) / totalStorageGivenBytes) * 100;
  const archivePercentage = (archives.reduce((sum, file) => sum + file.size, 0) / totalStorageGivenBytes) * 100;
  const musicPercentage = (music.reduce((sum, file) => sum + file.size, 0) / totalStorageGivenBytes) * 100;
  const othersPercentage = (others.reduce((sum, file) => sum + file.size, 0) / totalStorageGivenBytes) * 100;

  return (
    <div className="flex flex-col justify-between h-screen p-4">
      <h1 className="text-lg mb-4 font-bold text-center">Storage</h1>
      <div className="flex flex-col items-center flex-grow">
        <svg height="300px" width="300px" viewBox="0 0 300 300">
          {/* Background Arc */}
          {/* Background Arc */}
          <path d={describeArc(150, 150, 100, 0, 180)} fill="none" stroke="#e6e6e6" strokeWidth="40" />

          {/* Document Arc */}
          <path d={describeArc(150, 150, 100, 0, 180 * documentPercentage / 100)} fill="none" stroke="#3B82F6" strokeWidth="40" />

          {/* Images Arc */}
          <path d={describeArc(150, 150, 100, 180 * documentPercentage / 100, 180 * (documentPercentage + imagePercentage) / 100)} fill="none" stroke="#22C55E" strokeWidth="40" />

          {/* Archives Arc */}
          <path d={describeArc(150, 150, 100, 180 * (documentPercentage + imagePercentage) / 100, 180 * (documentPercentage + imagePercentage + archivePercentage) / 100)} fill="none" stroke="#EAB308" strokeWidth="40" />

          {/* Music Arc */}
          <path d={describeArc(150, 150, 100, 180 * (documentPercentage + imagePercentage + archivePercentage) / 100, 180 * (documentPercentage + imagePercentage + archivePercentage + musicPercentage) / 100)} fill="none" stroke="#EC4899" strokeWidth="40" />

          {/* Others Arc */}
          <path d={describeArc(150, 150, 100, 180 * (documentPercentage + imagePercentage + archivePercentage + musicPercentage) / 100, 180 * (documentPercentage + imagePercentage + archivePercentage + musicPercentage + othersPercentage) / 100)} fill="none" stroke="#A855F7" strokeWidth="40" />
          {/* "used out of" text centered below the arc */}
  <text
    x="150"
    y="170" // You may need to adjust this value to position the text correctly
    textAnchor="middle"
    fill='#737373'
    className='font-Payton text-sm'
  >
    used out of
  </text>   
          {/* Text for the percentage in the center */}
          <text
            x="150"
            y="100"
            fill={getPercentageColor(usedStoragePercentage)} // This will set the color based on the percentage
            fontSize="20"
            fontWeight="bold" // Make the text bold
            fontFamily="Arial Black, Arial, sans-serif" // Use Arial Black as the font family
            textAnchor="middle"
            alignmentBaseline="central"
            dy=".3em" // Adjust this value to center the text vertically
          >
            {usedStoragePercentage.toFixed(1)}%
          </text>
        </svg>
        <h1 className='text-center mt-[-140px]'></h1>
        {/* Text under the gauge */}
        <div className="flex justify-between w-full px-10">
          <div className='font-Payton text-white'>
            <span className='text-2xl text-gray-300'>{totalUsedStorageFormatted.split(' ')[0]}</span>
            {/* Add a non-breaking space here */}
            <span className='text-xs text-gray-300'>&nbsp;{totalUsedStorageFormatted.split(' ')[1]}</span>
          </div>
          <div className='font-Payton text-white mr-5'>
            <span className='text-2xl text-gray-300'>{formatBytes(totalStorageGivenBytes).split(' ')[0]}</span>
            {/* Add a non-breaking space here */}
            <span className='text-xs text-gray-300'>&nbsp;{formatBytes(totalStorageGivenBytes).split(' ')[1]}</span>
          </div>
        </div>
      </div>

      <div className="mb-[50px]">
        {/* Documents */}
        <div className="flex justify-between p-2">
          <div className="flex items-center">
            <img
              src="./Documents.png" alt="Document Icon" className="mr-2 bg-gray-700 w-11 h-11 p-2" width="40" height="40"
            />
            <span
              className="w-2 h-2 rounded-full bg-blue-500 mr-2">
            </span>
            <div>
              <p className="font-semibold">Documents</p>
              <p className="text-sm text-gray-500">{documents.length} files</p>
            </div>
          </div>
          <p className="font-semibold">
            {formatBytes(documents.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        {/* Images */}
        <div className="flex justify-between p-2">
          <div className="flex items-center">
            <img
              src="./Images.png" alt="Document Icon" className="mr-2 bg-gray-700 w-11 h-11 p-2" width="40" height="40"
            />
            <span
              className="w-2 h-2 rounded-full bg-green-500 mr-2" // Customize dot size and color
            ></span>
            <div>
              <p className="font-semibold">Images</p>
              <p className="text-sm text-gray-500">{images.length} files</p>
            </div>
          </div>
          <p className="font-semibold">
            {formatBytes(images.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        {/* Archives */}
        <div className="flex justify-between p-2">
          <div className="flex items-center">
            <img
              src="./Archives.png" alt="Document Icon" className="mr-2 bg-gray-700 w-11 h-11 p-2" width="40" height="40"
            />
            <span
              className="w-2 h-2 rounded-full bg-yellow-500 mr-2" // Customize dot size and color
            ></span>
            <div>
              <p className="font-semibold">Archives</p>
              <p className="text-sm text-gray-500">{archives.length} files</p>
            </div>
          </div>
          <p className="font-semibold">
            {formatBytes(archives.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        {/* Music */}
        <div className="flex justify-between p-2">
          <div className="flex items-center">
            <img
              src="./Media.png" alt="Document Icon" className="mr-2 bg-gray-700 w-11 h-11 p-2" width="40" height="40"
            />
            <span
              className="w-2 h-2 rounded-full bg-pink-500 mr-2" // Customize dot size and color
            ></span>
            <div>
              <p className="font-semibold">Media</p>
              <p className="text-sm text-gray-500">{music.length} files</p>
            </div>
          </div>
          <p className="font-semibold">
            {formatBytes(music.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        {/* Others */}
        <div className="flex justify-between p-2">
          <div className="flex items-center">
            <img
              src="./Others.ico" alt="Document Icon" className="mr-2 bg-gray-700 w-11 h-11 p-2" width="40" height="40"
            />
            <span
              className="w-2 h-2 rounded-full bg-purple-500 mr-2" // Customize dot size and color
            ></span>
            <div>
              <p className="font-semibold">Others</p>
              <p className="text-sm text-gray-500">{others.length} files</p>
            </div>
          </div>
          <p className="font-semibold">
            {formatBytes(others.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
      </div>
      {/* Upgrade to Pro button */}
      <div className="relative mb-9 flex items-center justify-start bg-blue-100 rounded-2xl overflow-hidden">
  {/* Background Image */}
  <img
    src="Rocket_cleanup.png" // Replace with your actual image path
    alt="Background"
    className="absolute inset-0 w-full h-full object-cover py-2"
  />

  {/* Black overlay with 75% opacity */}
  <div
    className="absolute inset-0 bg-gradient-to-r from-gray-500 to-black opacity-60"
  ></div>

  {/* Overlay Content */}
  <div className="relative z-20 p-6">
    {/* Headline */}
    <h2 className="text-2xl font-bold font-Payton text-white">
      NEED SPACE
    </h2>
    {/* Subheadline */}
    <p className="text-sm font-bold text-white">
      Up your storage
    </p>
    {/* Button */}
    <button
      onClick={() => setShowStoragePlans(true)}
      className="mt-4 bg-[#3EA88B] text-black text-sm font-bold py-2 px-4 rounded-xl"
    >
      Upgrade Plan
    </button>
  </div>
</div>




      {/* Conditionally render the StoragePlans component */}
      {showStoragePlans && (
        <StoragePlans
          onClose={handleClosePlans}
          onStorageUpdate={purchaseAdditionalStorage}
        />
      )}
    </div>
  );
};

export default StorageView;












// import React, { useState, useEffect, useMemo } from 'react';
// import { doc, getFirestore, updateDoc, getDoc, setDoc } from 'firebase/firestore';
// import { useAuth } from "../../firebase/auth"; // Import your useAuth hook
// import useStorageData from './StorageData'; // Ensure this hook is implemented correctly
// import StoragePlans from './StoragePlans';
// import { app } from '../../firebase/firebase'; // Correct path to your firebase config

// const StorageView = () => {
//   const { authUser } = useAuth();
//   const [totalStorageGivenBytes, setTotalStorageGivenBytes] = useState(1024 * 1024); // 1MB by default
//   const [path, setPath] = useState('/');
//   const db = getFirestore(app);
//   const [showStoragePlans, setShowStoragePlans] = useState(false);
//   const { documents, images, videos, music, others } = useStorageData(); // Use your storage data hook

//   useEffect(() => {
//     console.log("Documents: ", documents); // Debugging line
//     // ... other code inside useEffect ...
//   }, [documents]);

//   const fetchUserStorageData = async () => {
//     if (authUser?.username) {
//       const userDocRef = doc(db, 'users', authUser.username);
//       const docSnap = await getDoc(userDocRef);

//       if (docSnap.exists()) {
//         const userData = docSnap.data();
//         setTotalStorageGivenBytes(userData.storageLimit || (1 * 1024 * 1024)); // 1MB default
//       } else {
//         // Create a new document for the user with initial storage
//         await setDoc(userDocRef, {
//           email: authUser.email,
//           storageLimit: 1 * 1024 * 1024 // 1MB in bytes
//         });
//         setTotalStorageGivenBytes(1 * 1024 * 1024);
//       }
//     } else {
//       console.error('The user does not have a username set in authUser.');
//     }
//   };


//   useEffect(() => {
//     fetchUserStorageData();
//   }, []);

//   const purchaseAdditionalStorage = async (additionalBytes) => {
//     if (authUser?.username) {
//       const userDocRef = doc(db, 'users', authUser.username);
//       const docSnap = await getDoc(userDocRef);

//       if (docSnap.exists()) {
//         const currentStorageLimit = docSnap.data().storageLimit || (1 * 1024 * 1024);
//         const newTotalBytes = currentStorageLimit + additionalBytes;

//         await updateDoc(userDocRef, {
//           storageLimit: newTotalBytes
//         });

//         setTotalStorageGivenBytes(newTotalBytes);
//       } else {
//         console.error("No such user document!");
//       }
//     } else {
//       console.error('The user does not have a username set in authUser.');
//     }
//   };


//   useEffect(() => {
//     console.log(`New total storage: ${totalStorageGivenBytes} bytes`);
//   }, [totalStorageGivenBytes]);


//   // Calculate total used storage bytes
//   const totalUsedStorageBytes = useMemo(() => {
//     return [...documents, ...images, ...videos, ...music, ...others].reduce(
//       (sum, file) => sum + file.size,
//       0
//     );
//   }, [documents, images, videos, music, others]);

//   // const handleUpgradeClick = () => {
//   //   setPath('/plans'); // Set the path to simulate navigation
//   //   window.history.pushState({}, '', '/plans'); // Update the URL without navigating
//   // };

//   const formatBytes = (bytes, decimals = 2) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const dm = decimals < 0 ? 0 : decimals;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     // Make sure to add a space between the number and the unit
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
//   };


//   const handleClosePlans = () => {
//     setShowStoragePlans(false); // Assuming you have a state `showStoragePlans` controlling the visibility
//   };



//   const storageLeftBytes = totalStorageGivenBytes - totalUsedStorageBytes;

//   const totalUsedStorageFormatted = formatBytes(totalUsedStorageBytes);
//   const totalStorageGivenFormatted = formatBytes(totalStorageGivenBytes);
//   const storageLeftFormatted = formatBytes(storageLeftBytes);

//   const usedStoragePercentage = (totalUsedStorageBytes / totalStorageGivenBytes) * 100;
//   const unusedStoragePercentage = 100 - usedStoragePercentage;


//   // Convert polar coordinates to cartesian for the SVG arc path
//   const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
//     const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
//     return {
//       x: centerX + radius * Math.cos(angleInRadians),
//       y: centerY + radius * Math.sin(angleInRadians),
//     };
//   };

//   // Describe the arc path for SVG
//   const describeArc = (x, y, radius, startAngle, endAngle) => {
//     const start = polarToCartesian(x, y, radius, endAngle);
//     const end = polarToCartesian(x, y, radius, startAngle);
//     const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
//     return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
//   };

//   useEffect(() => {
//     // Calculate the arcs on load and when usedStoragePercentage changes
//     setArcBackground(describeArc(150, 150, 100, 0, 180));
//     setArcForeground(describeArc(150, 150, 100, 0, (180 * usedStoragePercentage) / 100));
//   }, [usedStoragePercentage]);

//   const strokeWidth = 40;
//   const radius = 100;
//   const viewBoxWidth = radius * 2 + strokeWidth;
//   const viewBoxHeight = radius + strokeWidth / 2;
//   const circumference = Math.PI * radius;

//   const [arcBackground, setArcBackground] = useState('');
//   const [arcForeground, setArcForeground] = useState('');


//   const [strokeDashoffset, setStrokeDashoffset] = useState(circumference)
//   useEffect(() => {
//     // Calculate the stroke dash offset based on the used storage percentage
//     setStrokeDashoffset(circumference - (circumference * usedStoragePercentage) / 100);
//   }, [usedStoragePercentage, circumference]);

//   const getPercentageColor = (percentage) => {
//     if (percentage <= 50) {
//       return '#4CAF50'; // Green color code
//     } else if (percentage <= 75) {
//       return '#FF9800'; // Orange color code
//     } else {
//       return '#F44336'; // Red color code
//     }
//   };

//   const fileData = useStorageData(); // Call the useStorageData hook

//   useEffect(() => {
//     console.log("File Data: ", fileData); // Debugging line
//     // ... other code inside useEffect ...
//   }, [fileData]);

//   // Check if fileData and documents are defined, and if there are any PDF documents
//   const hasPDF = fileData && fileData.documents && fileData.documents.some(doc => doc.type === 'pdf');

//   // Calculate sizes of each file category
//   const documentsSize = documents.reduce((sum, file) => sum + file.size, 0);
//   const imagesSize = images.reduce((sum, file) => sum + file.size, 0);
//   const videosSize = videos.reduce((sum, file) => sum + file.size, 0);
//   const musicSize = music.reduce((sum, file) => sum + file.size, 0);
//   const othersSize = others.reduce((sum, file) => sum + file.size, 0);
//   // ... similarly for videos, music, and others ...

//   // Calculate total size used
//   const totalSizeUsed = documentsSize + imagesSize + videosSize + musicSize + othersSize;

//   // Calculate percentages
//   const documentsPercentage = totalSizeUsed ? (documentsSize / totalSizeUsed) * 100 : 0;
//   const imagesPercentage = totalSizeUsed ? (imagesSize / totalSizeUsed) * 100 : 0;
//   const calculateOffset = (percentage) => {
//     return circumference - (circumference * percentage) / 100;

//     const documentsArcColor = fileData.documents.color || "#5b88b5"; // Default color if not found

//   };
//   return (
//     <div className="flex flex-col justify-between h-screen p-4">
//       <h1 className="text-lg mb-4 font-bold text-center">Storage</h1>
//       <div className="flex flex-col items-center flex-grow">
//         <svg height="300px" width="300px" viewBox="0 0 300 300">
//           <path
//             d={describeArc(150, 150, radius, 0, 180)}
//             fill="none"
//             stroke="#f8f8f8"
//             strokeWidth={strokeWidth}
//             strokeLinecap="butt" // Set to butt to avoid rounded ends
//           />

//           <path
//             d={describeArc(150, 150, radius, 0, 180 * documentsPercentage / 100)}
//             fill="none"
//             stroke={documentsArcColor} // Use the dynamic color here
//             strokeWidth={strokeWidth}
//             strokeLinecap="butt" // Set to butt to avoid rounded ends
//             strokeDasharray={circumference}
//             strokeDashoffset={calculateOffset(documentsPercentage)}
//           />
//           <text
//             x="150"
//             y="100"
//             fill={getPercentageColor(usedStoragePercentage)} // This will set the color based on the percentage
//             fontSize="20"
//             fontWeight="bold" // Make the text bold
//             fontFamily="Arial Black, Arial, sans-serif" // Use Arial Black as the font family
//             textAnchor="middle"
//             alignmentBaseline="central"
//             dy=".3em" // Adjust this value to center the text vertically
//           >
//             {usedStoragePercentage.toFixed(1)}%
//           </text>
//         </svg>
//         <h1 className='text-center mt-[-260px]'></h1>
//         {/* Text under the gauge */}
//         <div className="flex justify-between w-full px-10 mt-[7.5rem]">
//           <div className='font-Payton text-white'>
//             <span className='text-2xl text-gray-300'>{totalUsedStorageFormatted.split(' ')[0]}</span>
//             {/* Add a non-breaking space here */}
//             <span className='text-xs text-gray-300'>&nbsp;{totalUsedStorageFormatted.split(' ')[1]}</span>
//           </div>
//           <p className='font-Payton text-gray-500 text-sm'>used out of</p>
//           <div className='font-Payton text-white mr-5'>
//             <span className='text-2xl text-gray-300'>{formatBytes(totalStorageGivenBytes).split(' ')[0]}</span>
//             {/* Add a non-breaking space here */}
//             <span className='text-xs text-gray-300'>&nbsp;{formatBytes(totalStorageGivenBytes).split(' ')[1]}</span>
//           </div>
//         </div>
//       </div>

//       <div className="mb-[130px]">
//         {/* Documents */}
//         <div className="flex justify-between p-2">
//           <div className="flex items-center">
//             <img
//               src="./Documents.png" alt="Document Icon" className="mr-2 bg-gray-700 w-11 h-11 p-2" width="40" height="40"
//             />
//             <span
//               className="w-2 h-2 rounded-full bg-blue-500 mr-2" // Customize dot size and color
//             ></span>
//             <div>
//               <p className="font-semibold">Documents</p>
//               <p className="text-sm text-gray-600">{documents.length} files</p>
//             </div>
//           </div>
//           <p className="font-semibold">
//             {formatBytes(documents.reduce((sum, file) => sum + file.size, 0))}
//           </p>
//         </div>
//         {/* Images */}
// <div className="flex justify-between p-2">
//   <div className="flex items-center">
//     <img
//       src="./Images.png" alt="Document Icon" className="mr-2 bg-gray-700 w-11 h-11 p-2" width="40" height="40"
//     />
//     <span
//       className="w-2 h-2 rounded-full bg-green-500 mr-2" // Customize dot size and color
//     ></span>
//     <div>
//       <p className="font-semibold">Images</p>
//       <p className="text-sm text-gray-600">{images.length} files</p>
//     </div>
//   </div>
//   <p className="font-semibold">
//     {formatBytes(images.reduce((sum, file) => sum + file.size, 0))}
//   </p>
// </div>

//         {/* Videos */}
// <div className="flex justify-between p-2">
//   <div className="flex items-center">
//     <img
//       src="./Media.webp" alt="Document Icon" className="mr-2 bg-gray-700 w-11 h-11 p-2" width="40" height="40"
//     />
//     <span
//       className="w-2 h-2 rounded-full bg-red-500 mr-2" // Customize dot size and color
//     ></span>
//     <div>
//       <p className="font-semibold">Videos</p>
//       <p className="text-sm text-gray-600">{videos.length} files</p>
//     </div>
//   </div>
//   <p className="font-semibold">
//     {formatBytes(videos.reduce((sum, file) => sum + file.size, 0))}
//   </p>
// </div>
//         {/* Music */}
// <div className="flex justify-between p-2">
//   <div className="flex items-center">
//     <img
//       src="./Music.png" alt="Document Icon" className="mr-2 bg-gray-700 w-11 h-11 p-2" width="40" height="40"
//     />
//     <span
//       className="w-2 h-2 rounded-full bg-pink-500 mr-2" // Customize dot size and color
//     ></span>
//     <div>
//       <p className="font-semibold">Music</p>
//       <p className="text-sm text-gray-600">{music.length} files</p>
//     </div>
//   </div>
//   <p className="font-semibold">
//     {formatBytes(music.reduce((sum, file) => sum + file.size, 0))}
//   </p>
// </div>
//   {/* Others */}
//   <div className="flex justify-between p-2">
//     <div className="flex items-center">
//       <img
//         src="./Others.ico" alt="Document Icon" className="mr-2 bg-gray-700 w-11 h-11 p-2" width="40" height="40"
//       />
//       <span
//         className="w-2 h-2 rounded-full bg-purple-500 mr-2" // Customize dot size and color
//       ></span>
//       <div>
//         <p className="font-semibold">Others</p>
//         <p className="text-sm text-gray-600">{others.length} files</p>
//       </div>
//     </div>
//     <p className="font-semibold">
//       {formatBytes(others.reduce((sum, file) => sum + file.size, 0))}
//     </p>
//   </div>
// </div>
//       {/* Upgrade to Pro button */}
//       <div className="mb-[100px]">
//         <button
//           onClick={() => setShowStoragePlans(true)}
//           className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Upgrade to Pro
//         </button>
//       </div>
//       {/* Conditionally render the StoragePlans component */}
//       {showStoragePlans && (
//         <StoragePlans
//           onClose={handleClosePlans}
//           onStorageUpdate={purchaseAdditionalStorage}
//         />
//       )}
//     </div>
//   );
// };

// export default StorageView;


/*
import React, { useState, useEffect, useMemo } from 'react';
import { doc, getFirestore, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from "../../firebase/auth"; // Import your useAuth hook
import useStorageData from './StorageData'; // Ensure this hook is implemented correctly
import StoragePlans from './StoragePlans';
import { app } from '../../firebase/firebase'; // Correct path to your firebase config

const StorageView = () => {
  const { authUser } = useAuth();
  const { documents, images, archives, music, others } = useStorageData();
  const [totalStorageGivenBytes, setTotalStorageGivenBytes] = useState(1024 * 1024); // 1MB by default
  const [path, setPath] = useState('/');
  const db = getFirestore(app);
  const [showStoragePlans, setShowStoragePlans] = useState(false);


  const fetchUserStorageData = async () => {
    if (authUser?.username) {
      const userDocRef = doc(db, 'users', authUser.username);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setTotalStorageGivenBytes(userData.storageLimit || (1 * 1024 * 1024)); // 1MB default
      } else {
        // Create a new document for the user with initial storage
        await setDoc(userDocRef, {
          email: authUser.email,
          storageLimit: 1 * 1024 * 1024 // 1MB in bytes
        });
        setTotalStorageGivenBytes(1 * 1024 * 1024);
      }
    } else {
      console.error('The user does not have a username set in authUser.');
    }
  };


  useEffect(() => {
    fetchUserStorageData();
  }, []);

  const purchaseAdditionalStorage = async (additionalBytes) => {
    if (authUser?.username) {
      const userDocRef = doc(db, 'users', authUser.username);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const currentStorageLimit = docSnap.data().storageLimit || (1 * 1024 * 1024);
        const newTotalBytes = currentStorageLimit + additionalBytes;

        await updateDoc(userDocRef, {
          storageLimit: newTotalBytes
        });

        setTotalStorageGivenBytes(newTotalBytes);
      } else {
        console.error("No such user document!");
      }
    } else {
      console.error('The user does not have a username set in authUser.');
    }
  };


  useEffect(() => {
    console.log(`New total storage: ${totalStorageGivenBytes} bytes`);
  }, [totalStorageGivenBytes]);

  // // Calculate total used storage bytes
  // const totalUsedStorageBytes = useMemo(() => {
  //   const allFiles = [...documents, ...images, ...archives, ...music, ...others, ...uncategorized];
  //   return allFiles.reduce((sum, file) => sum + file.size, 0);
  // }, [documents, images, archives, music, others, uncategorized]);


  // const handleUpgradeClick = () => {
  //   setPath('/plans'); // Set the path to simulate navigation
  //   window.history.pushState({}, '', '/plans'); // Update the URL without navigating
  // };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleClosePlans = () => {
    setShowStoragePlans(false); // Assuming you have a state `showStoragePlans` controlling the visibility
  };

  // Calculate total used storage bytes and percentages
  const totalUsedStorageBytes = useMemo(() => {
   const allFiles = [...documents, ...images, ...archives, ...music, ...others];
   return allFiles.reduce((sum, file) => sum + file.size, 0);
 }, [documents, images, archives, music, others]);


  const storageLeftBytes = totalStorageGivenBytes - totalUsedStorageBytes;

  const totalUsedStorageFormatted = formatBytes(totalUsedStorageBytes);
  const totalStorageGivenFormatted = formatBytes(totalStorageGivenBytes);
  const storageLeftFormatted = formatBytes(storageLeftBytes);


  // Convert polar coordinates to cartesian for the SVG arc path
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Describe the arc path for SVG
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };


  const strokeWidth = 40;
  const radius = 100;
  const circumference = Math.PI * radius;


  const usedStoragePercentage = totalStorageGivenBytes > 0 ? (totalUsedStorageBytes / totalStorageGivenBytes) * 100 : 0;
  const documentPercentage = totalStorageGivenBytes > 0 ? (documents.reduce((sum, file) => sum + file.size, 0) / totalStorageGivenBytes) * 100 : 0;


  return (
    <div className="flex flex-col justify-between h-screen p-4">
      <h1 className="text-lg mb-4 font-bold text-center">Storage</h1>
      <div className="flex flex-col items-center flex-grow">
      <svg height="300px" width="300px" viewBox="0 0 300 300">
          <path d={describeArc(150, 150, 100, 0, 180)} fill="none" stroke="#e6e6e6" strokeWidth="40" />

          <path d={describeArc(150, 150, 100, 0, 180 * documentPercentage / 100)} fill="none" stroke="#a52a2a" strokeWidth="40" />

          <path d={describeArc(150, 150, 100, 180 * documentPercentage / 100, 180 * usedStoragePercentage / 100)} fill="none" stroke="#007bff" strokeWidth="40" />

          <text
            x="150"
            y="150"
            fill="#ffffff"
            fontSize="20"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {usedStoragePercentage.toFixed(1)}%
          </text>
        </svg>
      </div>
      <div className="text-center bottom-2">
        <p>Total space used: {totalUsedStorageFormatted}</p>
        <p>Total space given:{formatBytes(totalStorageGivenBytes)}</p>
        <p>Space left: {storageLeftFormatted}</p>
      </div>

      <div className="mt-4">
        <div className="flex justify-between p-2">
          <div>
            <p className="font-semibold">Documents</p>
            <p className="text-sm text-gray-600">{documents.length} files</p>
          </div>
          <p className="font-semibold">
            {formatBytes(documents.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        <div className="flex justify-between p-2">
          <div>
            <p className="font-semibold">Photos</p>
            <p className="text-sm text-gray-600">{images.length} files</p>
          </div>
          <p className="font-semibold">
            {formatBytes(images.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        <div className="flex justify-between p-2">
          <div>
            <p className="font-semibold">archives</p>
            <p className="text-sm text-gray-600">{archives.length} files</p>
          </div>
          <p className="font-semibold">
            {formatBytes(archives.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        <div className="flex justify-between p-2">
          <div>
            <p className="font-semibold">Music</p>
            <p className="text-sm text-gray-600">{music.length} files</p>
          </div>
          <p className="font-semibold">
            {formatBytes(music.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
        <div className="flex justify-between p-2">
          <div>
            <p className="font-semibold">Others</p>
            <p className="text-sm text-gray-600">{others.length} files</p>
          </div>
          <p className="font-semibold">
            {formatBytes(others.reduce((sum, file) => sum + file.size, 0))}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Import Files
        </button>
      </div>
      <div className="mt-[-200px]">
        <button
          onClick={() => setShowStoragePlans(true)}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Upgrade to Pro
        </button>

      </div>

      {showStoragePlans && (
        <StoragePlans
          onClose={handleClosePlans}
          onStorageUpdate={purchaseAdditionalStorage}
        />
      )}
    </div>
  );
};

export default StorageView; 

*/