// import Image from "next/image";
// import { AiOutlineHome } from "react-icons/ai";
// import { BsPeople } from "react-icons/bs";
// import { TiContacts } from "react-icons/ti";
// import { FiMail } from "react-icons/fi";
// import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
// import Link from "next/link";
// import { useContext } from "react";
// import { useRouter } from "next/router";
// import { SidebarContext } from "context/SidebarContext";

// const sidebarItems = [
//   {
//     name: "Home",
//     href: "/",
//     icon: AiOutlineHome,
//   },
//   {
//     name: "About",
//     href: "/about",
//     icon: BsPeople,
//   },
//   {
//     name: "Mails",
//     href: "/mails",
//     icon: FiMail,
//   },
//   {
//     name: "Contact",
//     href: "/contact",
//     icon: TiContacts,
//   },
// ];

// const Sidebar = () => {
//   const router = useRouter();
//   const { isCollapsed, toggleSidebarcollapse } = useContext(SidebarContext);

//   return (
//     <div className="sidebar__wrapper">
//       <button className="btn" onClick={toggleSidebarcollapse}>
//         {isCollapsed ? <MdKeyboardArrowRight /> : <MdKeyboardArrowLeft />}
//       </button>
//       <aside className="sidebar" data-collapse={isCollapsed}>
//         <div className="sidebar__top">
//           <Image
//             width={80}
//             height={80}
//             className="sidebar__logo"
//             src="/logo.png"
//             alt="logo"
//           />
//           <p className="sidebar__logo-name">Docomo</p>
//         </div>
//         <ul className="sidebar__list">
//           {sidebarItems.map(({ name, href, icon: Icon }) => {
//             return (
//               <li className="sidebar__item" key={name}>
//                 <Link
//                   className={`sidebar__link ${
//                     router.pathname === href ? "sidebar__link--active" : ""
//                   }`}
//                   href={href}
//                 >
//                   <span className="sidebar__icon">
//                     <Icon />
//                   </span>
//                   <span className="sidebar__name">{name}</span>
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>
//       </aside>
//     </div>
//   );
// };

// export default Sidebar;

// import React from "react";
// import { useAuth } from "../firebase/auth";
// import { RxDashboard, RxStar } from "react-icons/Rx";
// import { LuUsers2, LuTrash2, LuHelpCircle, LuSettings } from "react-icons/Lu";
// import { TbBrandGoogleAnalytics, TbLogout2 } from "react-icons/Tb";

// function Sidebar() {
//     const { signOut } = useAuth();

//     return (
//         <div className="p-6 w-[280px] h-screen bg-black z-20 fixed top-0 -left-96 lg:left-0 lg:w-65  peer-focus:left-0 peer:transition ease-out delay-150 duration-200 rounded-r-3xl flex justify-center">
// <div className="flex flex-col justify-start item-center">
//     <div className="flex items-center justify-center">
//         <img
//             src="/logo.png"
//             alt="Your Alt Text"
//             className="h-11 w-11"
//         />
//         <h1 className="text-[#a3e635] font-extrabold relative p-2">
//             <span className="relative z-10 text-5xl">D</span>
//             <span className="relative z-10 text-2xl">ocomo</span>
//         </h1>
//     </div>

//                 <div className=" my-4 pb-4">
//                     {/* Dashboard */}
//                     <div className={`flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md group cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-[#a3e635] hover:text-white transition-transform duration-300 m-auto`}>
//                         <RxDashboard className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300 " />
//                         <h3 className="text-base text-gray-300 font-semi-bold group-hover:text-black group-hover:font-bold transition-colors duration-300">
//                             Dashboard
//                         </h3>
//                     </div>

//                     <div className={`flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md group cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-[#a3e635] hover:text-white transition-transform duration-300 m-auto`}>
//                         <LuUsers2 className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
//                         <h3 className="text-base text-gray-300 font-semi-bold group-hover:text-black group-hover:font-bold transition-colors duration-300">
//                             Shared
//                         </h3>
//                     </div>
//                     {/* Starred Files */}
//                     <div className={`flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md group cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-[#a3e635] hover:text-white transition-transform duration-300 m-auto`}>
//                         <RxStar className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
//                         <h3 className="text-base text-gray-300 font-semi-bold group-hover:text-black group-hover:font-bold transition-colors duration-300">
//                             Stared Files
//                         </h3>
//                     </div>
//                     {/* Statistic  */}
//                     <div className="flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md group cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-[#a3e635] hover:text-white transition-transform duration-300 m-auto">
//                         <TbBrandGoogleAnalytics className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
//                         <h3 className="text-base text-gray-300 font-semi-bold group-hover:text-black group-hover:font-bold transition-colors duration-300">
//                             Statistic
//                         </h3>
//                     </div>
//                     {/* Settings */}
//                     <div className="flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md group cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-[#a3e635] hover:text-white transition-transform duration-300 m-auto">
//                         <LuSettings className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
//                         <h3 className="text-base text-gray-300 font-semi-bold group-hover:text-black group-hover:font-bold transition-colors duration-300">
//                             Settings
//                         </h3>
//                     </div>

//                     {/* Trash  */}
//                     <div className="flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md group cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-[#a3e635] hover:text-white transition-transform duration-300 m-auto">
//                         <LuTrash2 className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
//                         <h3 className="text-base text-gray-300 font-semi-bold group-hover:text-black group-hover:font-bold transition-colors duration-300">
//                             Trash
//                         </h3>
//                     </div>
//                     {/* Help  */}
//                     <div className="flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md group cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-[#a3e635] hover:text-white transition-transform duration-300 m-auto">
//                         <LuHelpCircle className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
//                         <h3 className="text-base text-gray-300 font-semi-bold group-hover:text-black group-hover:font-bold transition-colors duration-300">
//                             Help
//                         </h3>
//                     </div>
//                 </div>
//                 {/* Setting */}
//                 <div className="mt-60">
//                     {/* Logout */}
//                     <div className="my-2">
//                         <div className="flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md group cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-[#a3e635] hover:text-white transition-transform duration-300 m-auto">
//                             <TbLogout2 className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
//                             <h3 className="text-base text-gray-300 font-semi-bold group-hover:text-black group-hover:font-bold transition-colors duration-300" onClick={signOut}>
//                                 Logout
//                             </h3>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
// export default Sidebar

import Link from 'next/link';
import { useRouter } from 'next/router';
import { RxDashboard, RxStar } from "react-icons/Rx";
import { LuUsers2, LuTrash2, LuHelpCircle, LuSettings } from "react-icons/Lu";
import { TbBrandGoogleAnalytics, TbLogout2 } from "react-icons/Tb";
import { useAuth } from "../firebase/auth";

export default function Layout({ children }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { authUser } = useAuth(); // Assuming `useAuth` provides an `authUser` that is null when not authenticated


  const iconMapping = {
    'Dashboard': <RxDashboard className="icon-class" />,
    //'Shared': <LuUsers2 className="icon-class" />,
    'Stared Files': <RxStar className="icon-class" />,
    //'Statistic': <TbBrandGoogleAnalytics className="icon-class" />,
    //'Settings': <LuSettings className="icon-class" />,
    'Trash': <LuTrash2 className="icon-class" />,
    //'Help': <LuHelpCircle className="icon-class" />,
  }

  const menuItems = [
    { href: '/', title: 'Dashboard' },
    //{ href: '/shared', title: 'Shared' },
    { href: '/stared_files', title: 'Stared Files' },
    //{ href: '/statistic', title: 'Statistic' },
    //{ href: '/settings', title: 'Settings' },
    { href: '/trash', title: 'Trash' },
    //{ href: '/help', title: 'Help' },
  ];

  return (
    authUser && 
    <div className='min-h-screen flex flex-col'>
      <div className='flex flex-col md:flex-row flex-1'>
        <div className="p-6 w-[280px] h-screen bg-black z-20 fixed top-0 -left-96 lg:left-0 lg:w-65  peer-focus:left-0 peer:transition ease-out delay-150 duration-200 rounded-r-3xl flex justify-center">
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
              <div className="mt-[85]">
                {/* Logout */}
                <div className="my-2">
                  <div className="flex mb-2 justify-start items-center gap-4 pl-5 p-2 rounded-md group cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-[#a3e635] hover:text-white transition-transform duration-300 m-auto">
                    <TbLogout2 className="text-2xl text-gray-600 group-hover:text-black transform scale-100 group-hover:scale-125 transition-transform duration-300" />
                    <h3 className="text-base text-gray-300 font-semi-bold group-hover:text-black group-hover:font-bold transition-colors duration-300" onClick={signOut}>
                      Logout
                    </h3>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </div>
        <main className='flex-1'>{children}</main>
      </div>
    </div>
  );
}
