export function TreeRenderer({ items = [] }) {

    if (!items.length) return null;

    return (
        <div className="ml-5 border-l border-gray-400 pl-4 flex flex-col gap-3">
            {items.map(item => (
                <div key={item.id} className="flex flex-col gap-1">

                    <div className="font-bold text-white">
                        {item.title}
                    </div>

                    <div className="text-sm opacity-70">
                        {item.type}
                    </div>


                    {item.children?.length > 0 && (
                        <TreeRenderer items={item.children}/>
                    )}

                </div>
            ))}
        </div>
    );
}