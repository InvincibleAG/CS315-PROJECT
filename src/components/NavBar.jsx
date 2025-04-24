import { Link, useNavigate } from 'react-router-dom'

export default function NavBar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isLoggedIn = !!localStorage.getItem('token')
  const isAdmin = user.isAdmin

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">  
  <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">  
    <Link
      to="/events"
      className="flex items-center space-x-3 rtl:space-x-reverse"
    >
      <img
        src="teacher.svg"
        className="h-8"
        alt="Lecture Hall Booking Logo"
      />
      <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
        Lecture Hall Booking System
      </span>
    </Link>
    
    <button
      data-collapse-toggle="navbar-default"
      type="button"
      className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      aria-controls="navbar-default"
      aria-expanded="false"
    >
      <span className="sr-only">Open main menu</span>
      <svg
        className="w-5 h-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 17 14"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M1 1h15M1 7h15M1 13h15"
        />
      </svg>
    </button>

    <div className="hidden w-full md:block md:w-auto" id="navbar-default">
      <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
        {isLoggedIn ? (
          <>
            <li>
              <span className="block py-2 px-3 text-gray-900 dark:text-white">
                Welcome, {user.name}
              </span>
            </li>
            {isAdmin ? (
              <li>
                <Link
                  to="/admin/events"
                  className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  Manage Events
                </Link>
                <Link 
                    to="/calendar" 
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white"
                  >
                    Calendar
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    to="/events"
                    className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                  >
                    My Events
                  </Link>
                  <Link 
                    to="/calendar" 
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white"
                  >
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link
                    to="/events/new"
                    className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                  >
                    Lodge Event
                  </Link>

                </li>
              </>
            )}
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left block py-2 px-3 bg-blue-700 text-white rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/login"
                className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
              >
                Sign Up
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  </div>
</nav>


  )
}
