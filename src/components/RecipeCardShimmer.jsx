export default function RecipeCardShimmer() {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
        </div>
    );
}
