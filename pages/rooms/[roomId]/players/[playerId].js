import Layout from "../../../../components/MyLayout.js";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import db from "../../../../utils/firebase";
import StartGame from "../../../../components/StartGame";
import { takeACard, isWild } from "../../../../utils/game";
import Button from "../../../../components/Button";
export default function Game() {
  const [room, setRoom] = useState(null);
  const [playersActive, setPlayersActive] = useState([]);
  const router = useRouter();
  const roomId = router.query.roomId;
  const playerId = router.query.playerId;
  const link_jugadores = router.asPath;

  useEffect(() => {
    if (roomId) {
      const roomRef = db.collection("rooms").doc(roomId);

      roomRef.onSnapshot((roomRef) => {
        setRoom(roomRef.data());
      });

      roomRef.collection("players").onSnapshot(function (querySnapshot) {
        var players = [];

        querySnapshot.forEach(function (doc) {
          players.push(doc);
        });
        setPlayersActive(players);
      });
    }
  }, [roomId]);

  const onSubmit = (e) => {
    event.preventDefault();
    const roomRef = db.collection("rooms").doc(roomId);
    const usedCards = {};
    const firstCard = takeACard(usedCards);
    let color;
    if (isWild(firstCard)) {
      color = "red";
    } else {
      console.log("color es null");
      color = null;
    }
    playersActive.forEach((playerActive) => {
      const cards = [];
      for (var i = 1; i <= 7; i++) {
        const card = takeACard(usedCards);
        cards.push(card);
      }

      playerActive.ref.set(
        {
          cards: cards,
        },
        { merge: true }
      );
    });

    roomRef.set(
      {
        playing: true,
        discardPile: firstCard,
        currentMove: 0,
        deckDict: usedCards,
        isReverse: false,
        discardColor: color,
        drawPile: false,
      },
      { merge: true }
    );
  };

  if (!room) {
    return <Layout>Loading...</Layout>;
  }
  if (room.playing) {
    return (
      <Layout>
        <StartGame
          room={room}
          roomId={roomId}
          playersActive={playersActive}
          playerId={playerId}
        />
      </Layout>
    );
  } else {
    const playersSlots = [];
    for (let i = 0; i < room.count; i++) {
      const player = playersActive[i];
      playersSlots.push(
        <li className="py-2 text-gray-700" key={i}>
          <div className="flex">
            <span className="flex-auto">
              {" "}
              {player ? player.data().name : "...esperando jugador"}
              {player && player.id === playerId ? " (vos)" : null}
            </span>
            {player ? <span>✅</span> : null}
          </div>
        </li>
      );
    }
    return (
      <main className="bg-gray-900 flex flex-col min-h-screen">
        <Layout />
        <div className="flex-auto px-4 py-8 px-4 py-8 mx-auto w-full">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-lg ">
              <div
                className="bg-white p-4 rounded shadow"
                style={{ width: "30em" }}
              >
                <div className="my-4">
                  <p className="text-gray-700 font-bold">
                    Link para compartir:
                  </p>
                  <input
                    className="w-full text-gray-700 border-2 border-gray-300 h-12 mt-1 p-2 rounded g-gray-200 my-4"
                    readOnly
                    value={`${window.location.protocol}//${window.location.host}/rooms/${roomId}`}
                  ></input>
                  <RoomLinkButton
                    link={`${window.location.protocol}//${window.location.host}/rooms/${roomId}`}
                  />
                </div>
                <div className="my-4">
                  <p className="text-gray-700 font-bold">Jugadores:</p>
                  <ol className="divide-y divide-gray-400 list-decimal pl-5">
                    {playersSlots}
                  </ol>
                </div>
                <Button
                  color={playersActive.length == room.count ? "green" : "red"}
                  onClick={onSubmit}
                  className="w-full"
                >
                  Empezar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

const RoomLinkButton = ({ link }) => {
  const [copiedLinkToClipboard, setCopiedLinkToClipboard] = useState(false);
  const handleClick = () => {
    navigator.clipboard.writeText(link).then(
      function () {
        setCopiedLinkToClipboard(true);
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  };
  return (
    <>
      <Button onClick={handleClick} color={"yellow"}>
        Click para copiar link
      </Button>
      {/* <button onClick={handleClick}>Click para copiar link</button> */}
      {copiedLinkToClipboard ? " Copiado!" : null}
    </>
  );
};