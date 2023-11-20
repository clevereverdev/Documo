import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/router';

function FolderItemSmall({ folder }) {
  const router = useRouter();

  const handleFolderClick = () => {
    // Navigate to the folder details page or the appropriate route
    // Replace '/folder/[folderId]' with your actual route
    // and make sure `folder.id` is the correct property for the folder's ID
    router.push(`/folder/${folder.id}`);
  };

  return (
    <div
      className='flex gap-3 hover:bg-gray-100 p-2 rounded-md cursor-pointer'
      onClick={handleFolderClick} // Attach the event handler here
    >
      <Image
        src='/folder.png'
        alt='folder'
        width={20}
        height={20}
      />
      <h1>{folder.name}</h1>
    </div>
  );
}

export default FolderItemSmall;
