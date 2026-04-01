// src/components/CategoryGrid.tsx
const categories = [
  { name: "Sayur", icon: "🥬" },
  { name: "Buah", icon: "🍎" },
  { name: "Daging", icon: "🥩" },
  { name: "Sembako", icon: "🍚" },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-white mt-2">
      {categories.map((cat) => (
        <div key={cat.name} className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center w-12 h-12 bg-[#59cfb7]/20 rounded-full text-2xl">
            {cat.icon}
          </div>
          <span className="text-xs font-medium text-[#1a1a1a]">{cat.name}</span>
        </div>
      ))}
    </div>
  );
}