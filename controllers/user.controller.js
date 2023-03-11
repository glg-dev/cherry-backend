const UserModel = require('../models/user.model')
const ObjectID = require('mongoose').Types.ObjectId

module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password")
  res.status(200).json(users)
}

module.exports.userInfo = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(400).send('Cet utilisateur n\'existe pas');
    }

    res.send(user);

  } catch (err) {
    console.log('ID inconnu : ' + err);
    res.status(500).send('Une erreur s\'est produite lors de la recherche de l\'utilisateur');
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id)
    if (!user) {
      return res.status(400).send('Cet utilisateur n\'existe pas');
    }
    const updateUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.status(200).json(updateUser)
  } catch (err) {
    return res.status(500).json({ error: err })
  }
}

module.exports.deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id)
      if (!user) {
      return res.status(400).send('Cet utilisateur n\'existe pas');
    }
    await UserModel.findByIdAndRemove({ _id: req.params.id})
    res.status(200).json("Utilisateur supprimé avec succès ! ID : " + req.params.id);
  } catch (err) {
    res.status(500).json({ message: err })
  }
}

module.exports.follow = async (req, res) => {
  if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.likerId)) {
    if (!ObjectID.isValid(req.params.id)) {
      return res.status(400).send('unknown ID : ' + req.params.id);
    } else return res.status(400).send('unknown ID : ' + req.body.likerId);
  }
  try {
    // Add to following list
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { followers: req.body.likerId } },
      { new: true, upsert: true}
    ).then((docs) => res.status(201).send(docs))
    // Add to followers list
    await UserModel.findByIdAndUpdate(
      req.body.likerId,
      { $addToSet: { following: req.params.id } },
      { new: true, upsert: true}
    )
  } catch (err) {
    res.status(500).json({ message: err })
  }
}

module.exports.unfollow = async (req, res) => {
  if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToUnfollow)) {
    if (!ObjectID.isValid(req.params.id)) {
      return res.status(400).send('unknown ID : ' + req.params.id);
    } else return res.status(400).send('unknown ID : ' + req.body.idToUnfollow);
  }
  try {
    // Remove of following list
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { followers: req.body.unlikerId } },
      { new: true, upsert: true}
    ).then((docs) => res.status(201).send(docs))
    // Remove of followers list
    await UserModel.findByIdAndUpdate(
      req.body.unlikerId,
      { $pull: { following: req.params.id } },
      { new: true, upsert: true}
    )
  } catch (err) {
    res.status(500).json({ message: err })
  }
}