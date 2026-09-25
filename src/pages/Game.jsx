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
    {"name": "Aaron", "verse_location": "Exodus 28:1", "description": "Moses' brother who became Israel's first high priest", "category": "Priest", "special_moment": "God appointed Aaron and his sons to serve as priests for Israel."},
    {"name": "Abner", "verse_location": "1 Samuel 14:50", "description": "Commander of King Saul's army", "category": "Warrior", "special_moment": "Abner commanded Saul's army and later supported David before Joab killed him."},
    {"name": "Amasa", "verse_location": "2 Samuel 17:25", "description": "Commander of Absalom's army", "category": "Warrior", "special_moment": "David appointed Amasa over his army, but Joab later killed him."},
    {"name": "Asaph", "verse_location": "1 Chronicles 6:39", "description": "Levite singer appointed to lead worship", "category": "Biblical Figure", "special_moment": "David appointed Asaph to minister before the ark, and several psalm titles bear his name."},
    {"name": "Asher", "verse_location": "Genesis 30:13", "description": "Jacob's son and ancestor of the tribe of Asher", "category": "Patriarch", "special_moment": "Jacob blessed Asher with rich food, and the tribe later received land in northern Canaan."},
    {"name": "Babel", "verse_location": "Genesis 11:9", "description": "City where God confused human language", "category": "Place", "special_moment": "At Babel, God confused the builders' language and scattered them across the earth."},
    {"name": "Barak", "verse_location": "Judges 4:6", "description": "Commander who fought alongside Deborah", "category": "Warrior", "special_moment": "Barak defeated Sisera's army after Deborah summoned him to lead Israel's forces."},
    {"name": "Caleb", "verse_location": "Numbers 13:6", "description": "Spy who trusted God's promise about Canaan", "category": "Biblical Figure", "special_moment": "Caleb followed God wholeheartedly and later received Hebron as his inheritance."},
    {"name": "Cyrus", "verse_location": "Ezra 1:1", "description": "Persian king who permitted the temple's rebuilding", "category": "King", "special_moment": "Cyrus issued a decree allowing the exiles to return to Jerusalem and rebuild the temple."},
    {"name": "Enoch", "verse_location": "Genesis 5:24", "description": "Man who walked faithfully with God", "category": "Biblical Figure", "special_moment": "Enoch walked with God, and then God took him away."},
    {"name": "Ethan", "verse_location": "1 Kings 4:31", "description": "Ezrahite whose wisdom Solomon surpassed", "category": "Biblical Figure", "special_moment": "Ethan was renowned for wisdom, though Solomon was described as wiser."},
    {"name": "Hanan", "verse_location": "1 Chronicles 8:23", "description": "Benjaminite named in a biblical genealogy", "category": "Biblical Figure", "special_moment": "Hanan is listed among the descendants of Shashak who lived in Jerusalem."},
    {"name": "Haran", "verse_location": "Genesis 11:26", "description": "Abram's brother and Lot's father", "category": "Biblical Figure", "special_moment": "Haran died in Ur of the Chaldeans before his father Terah."},
    {"name": "Heber", "verse_location": "Judges 4:11", "description": "Kenite husband of Jael", "category": "Biblical Figure", "special_moment": "Sisera fled to Heber's tent, where Jael killed him while he slept."},
    {"name": "Hosea", "verse_location": "Hosea 1:1", "description": "Prophet who warned the northern kingdom", "category": "Prophet", "special_moment": "Hosea's marriage portrayed God's faithful love toward unfaithful Israel."},
    {"name": "Joash", "verse_location": "2 Kings 11:2", "description": "King hidden from Athaliah as a child", "category": "King", "special_moment": "Joash was hidden for six years and crowned king at the age of seven."},
    {"name": "Jonah", "verse_location": "Jonah 1:1", "description": "Prophet sent to preach to Nineveh", "category": "Prophet", "special_moment": "Jonah spent three days and nights inside a great fish before going to Nineveh."},
    {"name": "Jorah", "verse_location": "Ezra 2:18", "description": "Ancestor of a family that returned from exile", "category": "Biblical Figure", "special_moment": "Ezra lists 112 descendants of Jorah among those who returned with Zerubbabel."},
    {"name": "Joram", "verse_location": "2 Kings 3:1", "description": "Son of Ahab who became king of Israel", "category": "King", "special_moment": "Joram reigned over Israel for twelve years and removed the sacred stone of Baal."},
    {"name": "Judah", "verse_location": "Genesis 29:35", "description": "Jacob's son and ancestor of the tribe of Judah", "category": "Patriarch", "special_moment": "Judah became the ancestor of the royal line of David."},
    {"name": "Laban", "verse_location": "Genesis 24:29", "description": "Rebekah's brother and Jacob's uncle", "category": "Biblical Figure", "special_moment": "Laban deceived Jacob into marrying Leah before Rachel."},
    {"name": "Lydia", "verse_location": "Acts 16:14", "description": "Purple-cloth merchant who welcomed Paul's message", "category": "Early Christian", "special_moment": "Lydia and her household were baptized, and she hosted Paul and his companions."},
    {"name": "Manna", "verse_location": "Exodus 16:31", "description": "Food God provided for Israel in the wilderness", "category": "Symbol", "special_moment": "Manna sustained Israel during the wilderness journey and is discussed by Jesus in John 6."},
    {"name": "Micah", "verse_location": "Micah 1:1", "description": "Prophet from Moresheth who warned Judah", "category": "Prophet", "special_moment": "Micah called God's people to act justly, love mercy, and walk humbly with God."},
    {"name": "Moses", "verse_location": "Exodus 3:10", "description": "Prophet who led Israel out of Egypt", "category": "Prophet", "special_moment": "God worked through Moses to lead Israel through the sea and toward the promised land."},
    {"name": "Nahum", "verse_location": "Nahum 1:1", "description": "Prophet who announced Nineveh's downfall", "category": "Prophet", "special_moment": "Nahum delivered an oracle concerning God's judgment on Nineveh."},
    {"name": "Pekah", "verse_location": "2 Kings 15:25", "description": "King of Israel who overthrew Pekahiah", "category": "King", "special_moment": "Pekah seized the throne but later lost Israelite territory to Assyria."},
    {"name": "Rahab", "verse_location": "Joshua 2:1", "description": "Jericho woman who hid Israelite spies", "category": "Biblical Figure", "special_moment": "Rahab protected the spies, and her household was spared when Jericho fell."},
    {"name": "Reuel", "verse_location": "Exodus 2:18", "description": "Father of Zipporah in the story of Moses", "category": "Biblical Figure", "special_moment": "Moses stayed with Reuel's family and married his daughter Zipporah."},
    {"name": "Sarah", "verse_location": "Genesis 17:15", "description": "Abraham's wife and Isaac's mother", "category": "Matriarch", "special_moment": "Sarah gave birth to Isaac in her old age, fulfilling God's promise."},
    {"name": "Satan", "verse_location": "Job 1:6", "description": "Adversary who accused Job", "category": "Villain", "special_moment": "Satan challenged Job's faithfulness before God."},
    {"name": "Silas", "verse_location": "Acts 15:22", "description": "Paul's companion on his second missionary journey", "category": "Early Christian", "special_moment": "Silas was imprisoned with Paul in Philippi and prayed with him at midnight."},
    {"name": "Tamar", "verse_location": "Genesis 38:6", "description": "Judah's daughter-in-law and mother of Perez", "category": "Biblical Figure", "special_moment": "Tamar became the mother of Perez and Zerah through Judah."},
    {"name": "Titus", "verse_location": "Titus 1:4", "description": "Paul's coworker entrusted with churches in Crete", "category": "Early Christian", "special_moment": "Paul left Titus in Crete to appoint elders and complete unfinished work."},
    {"name": "Uzzah", "verse_location": "2 Samuel 6:6", "description": "Man struck dead after taking hold of the ark", "category": "Biblical Figure", "special_moment": "Uzzah reached for the ark when the oxen stumbled and died beside it."},
    {"name": "David", "verse_location": "1 Samuel 16:13", "description": "Second king of Israel, anointed by Samuel", "category": "King", "special_moment": "David captured Jerusalem and later ruled over all Israel."},
    {"name": "Herod", "verse_location": "Matthew 2:1", "description": "King who sought to kill the child Jesus", "category": "Villain", "special_moment": "Herod ordered the killing of boys in Bethlehem in an attempt to eliminate the Messiah."},
    {"name": "Judas", "verse_location": "Matthew 26:14", "description": "Disciple who betrayed Jesus", "category": "Villain", "special_moment": "Judas betrayed Jesus for thirty pieces of silver and later hanged himself."},
    {"name": "Ariel", "verse_location": "Isaiah 29:1", "description": "Poetic name for Jerusalem in Isaiah's oracle", "category": "Place", "special_moment": "Isaiah announced that Ariel, the city where David settled, would face distress."},
    {"name": "Zobah", "verse_location": "2 Samuel 8:3", "description": "Aramean kingdom defeated by David", "category": "Place", "special_moment": "David defeated the king of Zobah while restoring his control near the Euphrates."},
    {"name": "Sodom", "verse_location": "Genesis 19:24", "description": "City destroyed in Abraham and Lot's time", "category": "Place", "special_moment": "The Lord destroyed Sodom and Gomorrah with burning sulfur."},
    {"name": "Sceva", "verse_location": "Acts 19:14", "description": "Father of seven Jewish exorcists in Ephesus", "category": "Biblical Figure", "special_moment": "Sceva's sons tried to invoke Jesus' name and were overpowered by an evil spirit."},
    {"name": "Selah", "verse_location": "Psalm 3:2", "description": "Untranslated musical or liturgical term in Psalms", "category": "Symbol", "special_moment": "Selah occurs repeatedly in Psalms and Habakkuk, though its precise meaning is uncertain."},
    {"name": "Sinai", "verse_location": "Exodus 19:18", "description": "Mountain where God gave Israel the covenant law", "category": "Place", "special_moment": "God descended on Mount Sinai in fire and smoke before speaking to Israel."},
    {"name": "Cross", "verse_location": "John 19:18", "description": "Instrument on which Jesus was crucified", "category": "Symbol", "special_moment": "Jesus was crucified at Golgotha between two other men."},
    {"name": "Anani", "verse_location": "1 Chronicles 3:24", "description": "Descendant of David named in a genealogy", "category": "Biblical Figure", "special_moment": "Anani is listed as one of the seven sons of Elioenai."},
    {"name": "Swine", "verse_location": "Mark 5:13", "description": "Herd of pigs entered by expelled demons", "category": "Animal", "special_moment": "The herd rushed down a steep bank and drowned after the spirits entered it."},
    {"name": "Widow", "verse_location": "1 Kings 17:22", "description": "Mother at Zarephath whose son Elijah raised", "category": "Biblical Figure", "special_moment": "Elijah prayed, and the widow's son returned to life."},
    {"name": "Booth", "verse_location": "Leviticus 23:42", "description": "Temporary shelter used during the Feast of Booths", "category": "Object", "special_moment": "Israel lived in booths during the festival to remember the exodus from Egypt."},
    {"name": "Peter", "verse_location": "Matthew 16:16", "description": "Apostle who confessed Jesus as the Messiah", "category": "Apostle", "special_moment": "Peter became a leading witness in the early church and preached at Pentecost."},
    {"name": "James", "verse_location": "Matthew 4:21", "description": "Apostle who was the son of Zebedee and John's brother", "category": "Apostle", "special_moment": "James belonged to Jesus' inner circle and witnessed the Transfiguration."},
    {"name": "Jacob", "verse_location": "Genesis 25:26", "description": "Son of Isaac and Rebekah who was renamed Israel", "category": "Patriarch", "special_moment": "Jacob wrestled until daybreak and received the name Israel."}
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
      try {
        const updatedStats = await updateGameStats(auth.currentUser.uid, gameResult)
        if (updatedStats) {
          setUserStats(updatedStats)
        }
      } catch (error) {
        console.error("Error updating stats:", error)
      }
    } else {
      setShowLoginPrompt(true)
    }
  }

  const LoginPromptModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 dark:bg-black/50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white/95 dark:bg-black/80 p-6 rounded-xl border border-purple-500/30 max-w-md w-full"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <FiLock className="w-12 h-12 text-purple-400" />
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Sign In to Track Progress</h2>
          <p className="text-slate-700 dark:text-gray-300">Create an account to:</p>
          <ul className="text-left text-slate-700 dark:text-gray-300 space-y-2">
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
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black">
      <Navbar />
      <Toaster />
      <div className="pt-20 md:pt-24 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          {/* Add Game Mode Switch */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate('/crossword')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors border border-purple-500/30 dark:bg-purple-600/20 dark:hover:bg-purple-600/30 dark:text-purple-300"
            >
              <FiGrid className="w-4 h-4" />
              <span>Try Crossword</span>
            </button>
          </div>

          {/* Rest of the profile section */}
          {userProfile ? (
            <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md border border-slate-300 dark:border-gray-800 rounded-lg p-4">
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
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{userProfile.name}</h2>
                    <p className="text-sm text-slate-600 dark:text-gray-400">{userProfile.email}</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center md:justify-end">
                  <div className="text-center">
                    <p className="text-xs text-purple-400 font-medium">Games</p>
                    <p className="text-xl text-slate-900 dark:text-white">{userStats?.gamesPlayed || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-purple-400 font-medium">Win Rate</p>
                    <p className="text-xl text-slate-900 dark:text-white">{Math.round(userStats?.winPercentage || 0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-purple-400 font-medium">Streak</p>
                    <p className="text-xl text-slate-900 dark:text-white">{userStats?.currentStreak || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md border border-slate-300 dark:border-gray-800 rounded-lg p-4 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                <p className="text-slate-600 dark:text-gray-400">Playing as Guest</p>
                <button
                  onClick={() => setShowLoginPrompt(true)}
                  className="text-purple-700 hover:text-purple-900 text-sm dark:text-purple-400 dark:hover:text-purple-300"
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
