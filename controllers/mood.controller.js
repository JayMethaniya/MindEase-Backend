const Mood = require("../models/mood.model");

module.exports.addMood = async (req, res) => {
  try {
    const { userId, mood, note } = req.body;
    const newMood = new Mood({ userId, mood, note });
    await newMood.save();
    res.status(201).json(newMood);
  } catch (error) {
    console.error("Add Mood Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getMoods = async (req, res) => {
  try {
    const { userId } = req.params;
    const moods = await Mood.find({ userId });
    res.status(200).json(moods);
  } catch (error) {
    console.error("Get Moods Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
