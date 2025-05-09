"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "../components/Navbar"
import { auth } from "../firebase.config"
import Wordle from "../components/Wordle"
import { Toaster } from "react-hot-toast"
import { FiLock, FiGrid } from "react-icons/fi"
import { updateGameStats } from "../services/statsService"
import { getGameState } from "../services/gameStateService"
import { db } from "../firebase.config"
import { doc, onSnapshot } from "firebase/firestore"

export default function Game() {
  const navigate = useNavigate()
  const [userProfile, setUserProfile] = useState(null)
  const [currentWord, setCurrentWord] = useState(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [isFirstGameOfDay, setIsFirstGameOfDay] = useState(true)
  const [userStats, setUserStats] = useState(null)

  useEffect(() => {
    // Check authentication
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const profile = localStorage.getItem("userProfile")
        if (profile) {
          setUserProfile(JSON.parse(profile))
        }
      }
    })

    return () => unsubscribe()
  }, [navigate])

  // Define the Bible words as a proper variable
  const bibleWords = [
    {"name": "Aaron", "verse_location": "Exodus 4:14", "description": "Brother of Moses, first High Priest", "category": "prophets", "special_moment": "Aaron was appointed by God to be the first High Priest of Israel, assisting Moses in leading the people out of Egypt."},
    {"name": "Abner", "verse_location": "1 Samuel 14:50", "description": "Saul's commander", "category": "warrior", "special_moment": "Abner played a pivotal role in the transition of power from Saul to David, though he was later betrayed and killed by Joab."},
    {"name": "Amasa", "verse_location": "2 Samuel 17:25", "description": "Absalom's general", "category": "warrior", "special_moment": "Amasa was tragically killed by Joab despite David's attempt to reconcile with him after Absalom's rebellion."},
    {"name": "Asaph", "verse_location": "1 Chronicles 6:39", "description": "David's musician", "category": "minor bible charachter", "special_moment": "Asaph composed many psalms that continue to guide worship thousands of years later."},
    {"name": "Asher", "verse_location": "Genesis 30:13", "description": "Jacob's son", "category": "minor bible charachter", "special_moment": "Asher's descendants settled in fertile land, fulfilling Leah's declaration of blessing at his birth."},
    {"name": "Babel", "verse_location": "Genesis 11:9", "description": "Tower of Babel", "category": "symbolism", "special_moment": "The Tower of Babel represents human pride and God's intervention by confusing languages to scatter mankind."},
    {"name": "Barak", "verse_location": "Judges 4:6", "description": "Deborah's general", "category": "warrior", "special_moment": "Barak defeated Sisera's army with Deborah's guidance, though the final blow came from Jael's hand."},
    {"name": "Caleb", "verse_location": "Numbers 13:6", "description": "Faithful spy", "category": "minor bible charachter", "special_moment": "Caleb wholeheartedly followed God and was rewarded with inheritance in the Promised Land at age 85."},
    {"name": "Cyrus", "verse_location": "Ezra 1:1", "description": "King of Persia", "category": "kings", "special_moment": "Cyrus fulfilled Isaiah's prophecy by issuing a decree for Jews to return to Jerusalem and rebuild the temple."},
    {"name": "Enoch", "verse_location": "Genesis 5:18", "description": "Walked with God", "category": "minor bible charachter", "special_moment": "Enoch walked so closely with God that he was taken directly to heaven without experiencing death."},
    {"name": "Ethan", "verse_location": "1 Kings 4:31", "description": "Wise man", "category": "minor bible charachter", "special_moment": "Ethan was renowned for exceptional wisdom, though Solomon was deemed even wiser by God's special gift."},
    {"name": "Hanan", "verse_location": "1 Chronicles 8:23", "description": "Benjaminite", "category": "minor bible charachter", "special_moment": "Hanan was among the chief men of Benjamin who helped rebuild the tribe after near extinction."},
    {"name": "Haran", "verse_location": "Genesis 11:26", "description": "Abraham's brother", "category": "minor bible charachter", "special_moment": "Haran died in Ur of the Chaldeans, but his son Lot traveled with Abraham toward the promised land."},
    {"name": "Heber", "verse_location": "Judges 4:11", "description": "Jael's husband", "category": "minor bible charachter", "special_moment": "Heber's tent became the site where Jael killed Sisera by driving a tent peg through his temple while he slept."},
    {"name": "Hosea", "verse_location": "Hosea 1:1", "description": "Prophet", "category": "prophets", "special_moment": "Hosea's marriage to Gomer became a powerful living metaphor of God's faithful love for unfaithful Israel."},
    {"name": "Jedia", "verse_location": "1 Chronicles 26:2", "description": "Temple gatekeeper", "category": "warrior", "special_moment": "Jediael guarded sacred spaces during David's reign, protecting temple sanctity."},
    {"name": "Joash", "verse_location": "2 Kings 11:2", "description": "Boy king", "category": "kings", "special_moment": "Joash was hidden in the temple as an infant and later crowned king at age seven, preserving David's royal line."},
    {"name": "Jonah", "verse_location": "Jonah 1:1", "description": "Prophet", "category": "prophets", "special_moment": "Jonah survived three days inside a great fish before preaching to Nineveh, which repented at his message."},
    {"name": "Jorah", "verse_location": "Ezra 2:18", "description": "Returned exile", "category": "minor bible charachter", "special_moment": "Jorah was among those who returned from Babylonian exile to help rebuild Jerusalem and restore worship."},
    {"name": "Joram", "verse_location": "2 Kings 8:16", "description": "King of Judah", "category": "kings", "special_moment": "Joram became king of Judah and followed the ways of the kings of Israel, leading to trouble for his nation."},
    {"name": "Judah", "verse_location": "Genesis 29:35", "description": "Jacob's son", "category": "minor bible charachter", "special_moment": "Judah became the ancestor of the royal tribe from which King David and Jesus descended."},
    {"name": "Laban", "verse_location": "Genesis 24:29", "description": "Rebekah's brother", "category": "minor bible charachter", "special_moment": "Laban was the brother of Rebekah and later deceived Jacob into marrying both Leah and Rachel."},
    {"name": "Lydia", "verse_location": "Acts 16:14", "description": "Seller of purple", "category": "minor bible charachter", "special_moment": "Lydia was the first convert to Christianity in Europe and hosted Paul and his companions in her home."},
    {"name": "Maaca", "verse_location": "1 Kings 15:2", "description": "Abijah's mother", "category": "minor bible charachter", "special_moment": "Maacah was the mother of King Abijah and grandmother of King Asa of Judah."},
    {"name": "Manna", "verse_location": "Exodus 16:31", "description": "Heavenly bread", "category": "symbolism", "special_moment": "Manna sustained Israel in the wilderness, foreshadowing Christ as the Bread of Life."},
    {"name": "Micah", "verse_location": "2 Chronicles 13:2", "description": "Short for Micah", "category": "minor bible charachter", "special_moment": "Michaiah was the mother of King Abijah and influenced Judah's royal lineage."},
    {"name": "Moses", "verse_location": "Exodus 2:10", "description": "Led Israel from Egypt", "category": "prophets", "special_moment": "Moses parted the Red Sea to deliver Israel from Pharaoh's army, demonstrating God's power."},
    {"name": "Nahum", "verse_location": "Nahum 1:1", "description": "Prophet", "category": "prophets", "special_moment": "Nahum prophesied Nineveh's destruction as judgment for their cruelty to Israel."},
    {"name": "Pekah", "verse_location": "2 Kings 15:25", "description": "King of Israel", "category": "kings", "special_moment": "Pekah assassinated Pekahiah to become king but lost territory to Assyria."},
    {"name": "Rahab", "verse_location": "Joshua 2:1", "description": "Saved spies", "category": "minor bible charachter", "special_moment": "Rahab hid the Israelite spies in Jericho and was saved with her family when the city fell."},
    {"name": "Reuel", "verse_location": "Exodus 2:18", "description": "Moses' father-in-law", "category": "minor bible charachter", "special_moment": "Reuel, also known as Jethro, advised Moses on organizing the Israelites in the wilderness."},
    {"name": "Sarah", "verse_location": "Genesis 17:15", "description": "Abraham's wife", "category": "minor bible charachter", "special_moment": "Sarah miraculously gave birth to Isaac in her old age, fulfilling God's promise to Abraham."},
    {"name": "Satan", "verse_location": "Job 1:6", "description": "Adversary", "category": "villains", "special_moment": "Satan appears as the accuser of Job, challenging his faithfulness before God."},
    {"name": "Silas", "verse_location": "Acts 15:22", "description": "Paul's companion", "category": "minor bible charachter", "special_moment": "Silas accompanied Paul on his second missionary journey and was imprisoned with him in Philippi."},
    {"name": "Tamar", "verse_location": "Genesis 38:6", "description": "Judah's daughter-in-law", "category": "minor bible charachter", "special_moment": "Tamar secured her lineage through Judah by posing as a prostitute, becoming an ancestor of Jesus."},
    {"name": "Titus", "verse_location": "Titus 1:4", "description": "Paul's companion", "category": "minor bible charachter", "special_moment": "Titus was Paul's trusted companion and helper, tasked with organizing the church in Crete."},
    {"name": "Uzzah", "verse_location": "2 Samuel 6:6", "description": "Ark toucher", "category": "villains", "special_moment": "Uzzah was struck dead for steadying the Ark, showing God's holiness requires obedience over good intentions."},
    {"name": "David", "verse_location": "1 Samuel 16:13", "description": "Second king of Israel", "category": "kings", "special_moment": "David was anointed by Samuel and became Israel's greatest king, uniting the tribes and establishing Jerusalem as the capital."},
    {"name": "Herod", "verse_location": "Matthew 2:1", "description": "Killer of infants", "category": "villains", "special_moment": "Herod ordered the massacre of Bethlehem's children in an attempt to kill the newborn Messiah."},
    {"name": "Judas", "verse_location": "Matthew 26:14", "description": "Jesus' betrayer", "category": "villains", "special_moment": "Judas betrayed Christ with a kiss for thirty silver coins, then hanged himself in remorse."},
    {"name": "Ariel", "verse_location": "Isaiah 29:1", "description": "Jerusalem's symbol", "category": "symbolism", "special_moment": "Ariel ('Lion of God') became an altar hearth of judgment for Jerusalem's spiritual blindness."},
    {"name": "Zobah", "verse_location": "2 Samuel 8:3", "description": "Aramean kingdom", "category": "places", "special_moment": "David defeated Zobah's army, gaining control over strategic Syrian territory."},
    {"name": "Sodom", "verse_location": "Genesis 19:24", "description": "Destroyed city", "category": "places", "special_moment": "Sodom was obliterated by burning sulfur for its extreme wickedness and inhospitality to angels."},
    {"name": "Sceva", "verse_location": "Acts 19:14", "description": "Failed exorcist", "category": "villains", "special_moment": "Sceva's sons were beaten by a demon when attempting unauthorized use of Jesus' name for exorcism."},
    {"name": "Selah", "verse_location": "Psalm 3:4", "description": "Musical term", "category": "symbolism", "special_moment": "Selah appears 71 times in Psalms as a divine pause emphasizing God's sovereignty in worship."},
    {"name": "Habor", "verse_location": "2 Kings 17:6", "description": "Exile river", "category": "places", "special_moment": "Habor River marked the location where Assyria settled captured Israelites from Samaria."},
    {"name": "Flood", "verse_location": "Genesis 7:17", "description": "Noah's deluge", "category": "events", "special_moment": "God flooded the earth for 40 days to cleanse wickedness, sparing Noah's family and animals in the ark."},
    {"name": "Sinai", "verse_location": "Exodus 19:18", "description": "Law given", "category": "events", "special_moment": "God descended on Mount Sinai in fire and smoke to deliver the Ten Commandments."},
    {"name": "Cross", "verse_location": "John 19:18", "description": "Christ crucified", "category": "events", "special_moment": "Jesus was crucified at Golgotha, fulfilling prophecies of redemption for humanity."},
    {"name": "Tempt", "verse_location": "Matthew 4:1", "description": "Jesus tempted", "category": "events", "special_moment": "Jesus fasted 40 days and resisted Satan's temptations, quoting Scripture."},
    {"name": "Exile", "verse_location": "2 Kings 25:11", "description": "Babylon captivity", "category": "events", "special_moment": "Judah was exiled to Babylon for 70 years as judgment for idolatry."},
    {"name": "Entry", "verse_location": "Matthew 21:9", "description": "Triumphal entry", "category": "events", "special_moment": "Jesus entered Jerusalem on a donkey, hailed as King by crowds with palm branches."},
    {"name": "Fiery", "verse_location": "Daniel 3:25", "description": "Furnace miracle", "category": "events", "special_moment": "God protected Shadrach, Meshach, and Abednego in Nebuchadnezzar's fiery furnace."},
    {"name": "Storm", "verse_location": "Jonah 1:4", "description": "Jonah's tempest", "category": "events", "special_moment": "God sent a storm to redirect Jonah, who was fleeing His call to Nineveh."},
    {"name": "Quail", "verse_location": "Numbers 11:31", "description": "Meat provided", "category": "events", "special_moment": "God sent quail to feed complaining Israelites, but judgment followed their greed."},
    {"name": "Thief", "verse_location": "Luke 23:42", "description": "Penitent thief", "category": "events", "special_moment": "A crucified thief repented, and Jesus promised him paradise that very day."},
    {"name": "Canaa", "verse_location": "John 2:1", "description": "Water to wine", "category": "events", "special_moment": "Jesus performed His first miracle at Cana, turning water into wine at a wedding."},
    {"name": "Anani", "verse_location": "Daniel 2:19", "description": "Nebuchadnezzar's dream", "category": "events", "special_moment": "God revealed the king's dream to Daniel, saving wise men from execution."},
    {"name": "Swine", "verse_location": "Mark 5:13", "description": "Demons into pigs", "category": "events", "special_moment": "Jesus cast demons into a herd of pigs, which plunged into the Sea of Galilee."},
    {"name": "Widow", "verse_location": "1 Kings 17:22", "description": "Son resurrected", "category": "events", "special_moment": "Elijah prayed, and God revived the widow of Zarephath's dead son."},
    {"name": "Siloa", "verse_location": "John 9:7", "description": "Blind man healed", "category": "events", "special_moment": "Jesus healed a man born blind by applying mud and sending him to wash in Siloam."},
    {"name": "Geths", "verse_location": "Matthew 26:36", "description": "Jesus' agony", "category": "events", "special_moment": "Jesus prayed in Gethsemane, submitting to God's will before His arrest."},
    {"name": "Booth", "verse_location": "Leviticus 23:42", "description": "Feast of Tabernacles", "category": "events", "special_moment": "Israel dwelled in booths to remember their wilderness journey during this annual feast."},
    {"name": "Peter", "verse_location": "Matthew 16:18", "description": "Apostle, leader of early church", "category": "prophets", "special_moment": "Jesus declared Peter the 'rock' upon which He would build His church, giving him the keys to the kingdom of heaven."},
    {"name": "James", "verse_location": "Matthew 4:21", "description": "Son of Zebedee and brother of John", "category": "apostle", "special_moment": "James was one of the first disciples called by Jesus and was part of His inner circle, witnessing events like the Transfiguration."},
    {"name": "Jacob", "verse_location": "Genesis 25:26", "description": "Son of Isaac and Rebekah", "category": "prophets", "special_moment": "Jacob wrestled with God for an entire night"}
  ];

  // Function to get a consistent daily word based on date
  const getDailyBibleWord = () => {
    const today = new Date();
    // Reset time to midnight for consistent day calculation
    today.setHours(0, 0, 0, 0);
    
    // Get day of year (1-366)
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today - start;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Use the day of year to select a word (ensures word changes at midnight)
    const index = dayOfYear % bibleWords.length;
    
    console.log(`Today is day ${dayOfYear} of the year, showing word: ${bibleWords[index].name}`);
    return bibleWords[index];
  };

  // Set the current word when component loads, making sure it updates at midnight
  useEffect(() => {
    const dailyWord = getDailyBibleWord();
    setCurrentWord(dailyWord);
    
    // Check if we need to update the word at midnight
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeToMidnight = tomorrow - now;
    
    // Set a timer to update the word at midnight
    const midnightTimer = setTimeout(() => {
      const newDailyWord = getDailyBibleWord();
      setCurrentWord(newDailyWord);
      setIsFirstGameOfDay(true); // Reset first game flag for the new day
    }, timeToMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, []);

  useEffect(() => {
    const gameState = getGameState()
    if (gameState?.completed) {
      setIsFirstGameOfDay(false)
    }
  }, [])

  useEffect(() => {
    if (userProfile && auth.currentUser) {
      // Set up real-time listener for stats
      const unsubscribe = onSnapshot(
        doc(db, "users", auth.currentUser.uid),
        (doc) => {
          if (doc.exists()) {
            setUserStats(doc.data() || null)
          }
        },
        (error) => {
          console.error("Error fetching stats:", error)
        },
      )

      return () => unsubscribe()
    }
  }, [userProfile])

  if (!currentWord) return null

  const handleGameComplete = async (gameResult) => {
    if (userProfile && auth.currentUser) {
      console.log("Game completed with result:", gameResult)
      try {
        const updatedStats = await updateGameStats(auth.currentUser.uid, gameResult)
        console.log("Updated stats:", updatedStats)
        if (updatedStats) {
          setUserStats(updatedStats)
        }
      } catch (error) {
        console.error("Error updating stats:", error)
      }
    } else {
      console.log("No user profile or not authenticated")
      setShowLoginPrompt(true)
    }
  }

  const LoginPromptModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-black/80 p-6 rounded-xl border border-purple-500/30 max-w-md w-full"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <FiLock className="w-12 h-12 text-purple-400" />
          <h2 className="text-xl md:text-2xl font-bold text-white">Sign In to Track Progress</h2>
          <p className="text-gray-300">Create an account to:</p>
          <ul className="text-left text-gray-300 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-purple-400">•</span> Track your win streak
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">•</span> Save your statistics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-400">•</span> Compete with others
            </li>
          </ul>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Toaster />
      <div className="pt-20 md:pt-24 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          {/* Add Game Mode Switch */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate('/crossword')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30"
            >
              <FiGrid className="w-4 h-4" />
              <span>Try Crossword</span>
            </button>
          </div>

          {/* Rest of the profile section */}
          {userProfile ? (
            <div className="bg-black/50 backdrop-blur-md border border-gray-800 rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {userProfile.photo && (
                    <img
                      src={userProfile.photo || "/placeholder.svg"}
                      alt="Profile"
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-white">{userProfile.name}</h2>
                    <p className="text-sm text-gray-400">{userProfile.email}</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center md:justify-end">
                  <div className="text-center">
                    <p className="text-xs text-purple-400 font-medium">Games</p>
                    <p className="text-xl text-white">{userStats?.gamesPlayed || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-purple-400 font-medium">Win Rate</p>
                    <p className="text-xl text-white">{Math.round(userStats?.winPercentage || 0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-purple-400 font-medium">Streak</p>
                    <p className="text-xl text-white">{userStats?.currentStreak || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/50 backdrop-blur-md border border-gray-800 rounded-lg p-4 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                <p className="text-gray-400">Playing as Guest</p>
                <button
                  onClick={() => setShowLoginPrompt(true)}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Sign in to track progress
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 md:mt-8">
            <Wordle
              wordData={currentWord}
              onGameComplete={(result) => {
                if (isFirstGameOfDay && userProfile) {
                  handleGameComplete(result)
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>{showLoginPrompt && <LoginPromptModal />}</AnimatePresence>
    </div>
  )
}
