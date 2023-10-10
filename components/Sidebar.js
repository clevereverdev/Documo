import Link from 'next/link';
import { useRouter } from 'next/router';
import { RxDashboard, RxStar } from "react-icons/Rx";
import { BsFileEarmarkPdf } from "react-icons/Bs";
import { LuTrash2 } from "react-icons/Lu";
import { TbLogout2, TbFolder } from "react-icons/Tb";
import { useAuth } from "../firebase/auth";
import CreateFolderModel from './Folder/CreateFolderModel';

export default function Layout({ children }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { authUser } = useAuth(); // Assuming `useAuth` provides an `authUser` that is null when not authenticated


  const iconMapping = {
    'Dashboard': <RxDashboard className="icon-class" />,
    'Stared Files': <RxStar className="icon-class" />,
    'Trash': <LuTrash2 className="icon-class" />,
  }

  const menuItems = [
    { href: '/', title: 'Dashboard' },
    { href: '/stared_files', title: 'Stared Files' },
    { href: '/trash', title: 'Trash' },
  ];

  return (
    authUser &&
    <div className='min-h-screen flex flex-col'>
      <div className='flex flex-col md:flex-row flex-1'>
        <div className="p-6 w-[280px] h-screen bg-black z-20 fixed top-0 left-0 lg:w-65 rounded-r-3xl flex justify-center">
          <div className="flex flex-col justify-start item-center">
            <div className="flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Your Alt Text"
                className="h-11 w-11"
              />
              <h1 className="text-[#a3e635] font-extrabold relative p-2">
                <span className="relative z-10 text-5xl">D</span>
                <span className="relative z-10 text-2xl">ocomo</span>
              </h1>
            </div>
            <nav>
              <ul>
                {menuItems.map(({ href, title }) => (
                  <li className='m-2' key={title}>
                    <Link href={href}>
                      <div
                        className={`flex items-center gap-4 pl-5 p-2 rounded-md group cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-[#a3e635] hover:text-white transition-transform duration-300 m-auto ${router.asPath === href && 'bg-fuchsia-600 text-white'
                          }`}
                      >
                        {iconMapping[title]}
                        <span>{title}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Add File & Add Folder buttons */}
              <div className="mt-4">
                <div className="flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md bg-green-500 hover:bg-green-600 transition-colors duration-300 m-auto">
                  <BsFileEarmarkPdf className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
                  <span className='text-white'>Add File</span>
                </div>
                <div className="flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md bg-red-500 hover:bg-red-600 transition-colors duration-300 m-auto" onClick={()=>document.getElementById('my_modal_3').showModal()}>
                  <TbFolder className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
                  <span className='text-white'>Add Folder</span>
                </div>
                 {/* <button className="mt-4 bg-blue-500 hover:bg-blue-600 p-2 rounded-md" onClick={()=>document.getElementById('my_modal_3').showModal()}>Open Modal</button> */}
              </div>
              {/* Logout */}
              <div className="mb-2">
                <div className="flex justify-start items-center gap-4 pl-5 p-2 rounded-md group cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-[#a3e635] hover:text-white transition-transform duration-300 mt-40">
                  <TbLogout2 className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
                  <h3 className="text-base text-gray-300 font-semi-bold group-hover:text-black group-hover:font-bold transition-colors duration-300" onClick={signOut}>
                    Logout
                  </h3>
                </div>
              </div>
            </nav>
          </div>
        </div>
        <main className='main-content flex-1 ml-[280px]'>
          {children}
        </main>
        {/* <button className="btn" onClick={() => document.getElementById('my_modal_1').showModal()}>open modal</button> */}
        <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <CreateFolderModel/>
        </div>
      </dialog>
      </div>
    </div>
  );
}

