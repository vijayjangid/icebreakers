import "./style.css";

export default function Dropdown(props) {
    const { open, onClick, onChange, items, selectedItem, data } = props;

    return (<div className="dropdown">
        <button className="dropdown-button" onClick={onClick}>
            {data[selectedItem]?.map((y) => y.content + " ")} <span>▼</span>
        </button>
        {open && <div className='dropdown-content'>
            {items.map((x) => (
                <button
                    key={x}
                    onClick={() => onChange(x)}
                >
                    {data[x].map((y) => y.content + " ")}
                </button>
            ))}
        </div>
        }
    </div>)
}