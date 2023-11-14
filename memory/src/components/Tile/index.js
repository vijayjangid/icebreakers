import "./style.css";
const urlParams = new URLSearchParams(window.location.search);
const DEBUG = !!urlParams.get("debug");

export default function Tile(props) {
    const { data, bombed: bombTriggered, firstGuessKey, secondGuessKey, onClick } = props;
    const { id, key, guessed, bombed, content } = data;

    return (<div
        key={key}
        className={`flip-card ${guessed ||
            key === firstGuessKey ||
            key === secondGuessKey
            ? "flipped"
            : ""
            } ${guessed ? "guessed" : ""} ${bombTriggered && bombed ? "bombed" : ""
            }`}
        onClick={onClick}
        role="button"
    >
        <div className="card-inner">
            <div className="card-front">{DEBUG ? content : "?"}</div>
            <div className="card-back">
                <span>{bombTriggered && bombed ? "🔥" : !bombTriggered && bombed ? "🎉" : content}</span>
                <span className={`card-score`}>
                    {bombTriggered && bombed
                        ? "0"
                        : !bombTriggered && bombed
                            ? "+20"
                            : guessed
                                ? "+10"
                                : ""}
                </span>
            </div>
        </div>
    </div>)
}