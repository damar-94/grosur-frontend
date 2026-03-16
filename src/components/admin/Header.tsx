"use client";

export default function Header() {
  return (
    <header className="bg-white shadow border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">Welcome !</h1>
        <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </header>
  );
}
