import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebase/firebase"; // Adjust the import path as needed
import Layout from "@/Sidebar";

const tabs = ['All Items', 'Photos', 'Videos', '|', 'Years', 'Months', 'Days'];

const fileTypes = {
  Photos: ['png', 'jpg', 'jpeg', 'webp'],
  Videos: ['mp4', 'mov']
};

const Photos = () => {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('Photos');
  const [filteredItems, setFilteredItems] = useState([]);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchItems = async () => {
      const itemsRef = collection(db, "files");
      const querySnapshot = await getDocs(itemsRef);
      const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems);
    };

    fetchItems();
  }, [db]);

  useEffect(() => {
    // Filter by file type
    const fileTypeFilter = fileTypes[activeTab] || [];
    const filteredByType = items.filter(item => fileTypeFilter.length === 0 || fileTypeFilter.includes(item.type));

    // Further filter/sort based on the tab
    let sortedFilteredItems = [];
    if (activeTab === 'Years') {
      sortedFilteredItems = filteredByType.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
    } else if (activeTab === 'Months') {
      // Sorting logic for months here
    } else if (activeTab === 'Days') {
      // Sorting logic for days here
    } else {
      sortedFilteredItems = filteredByType;
    }

    setFilteredItems(sortedFilteredItems);
  }, [activeTab, items]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 h-[760px]">
        <div className="flex flex-col items-start mb-4">
          <h1 className="text-xl font-semibold">Photos</h1>
          <div className="flex space-x-4 mt-3">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-400">
              <img
                className="object-cover object-center w-full h-full"
                src={item.imageUrl}
                alt={item.name}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Photos;
