export default function GadgetDetailImages({ images, selectedImage, handleImageSelect, gadgetName }) {
    const largeImageSrc = selectedImage || (images.length > 0 ? images[0] : '');
    return (
        <div className="flex flex-col gap-4">
            <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center group">
                <img
                    src={largeImageSrc}
                    alt={`${gadgetName} large view`}
                    className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                        e.target.alt = 'Image not available';
                    }}
                />
            </div>
            <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                {images.map((img) => (
                    <button
                        key={img}
                        className={`w-16 h-16 border rounded-md overflow-hidden flex-shrink-0 ${selectedImage === img ? 'border-green-600 dark:border-green-400 border-2' : 'border-gray-200 dark:border-gray-700'}`}
                        onClick={() => handleImageSelect(img)}
                    >
                        <img
                            src={img}
                            alt={`${gadgetName} thumbnail`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.alt = 'Image not available';
                            }}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
