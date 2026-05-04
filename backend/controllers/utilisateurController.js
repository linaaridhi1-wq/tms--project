const{Utilisateur,Role}=require('../models');
exports.lister=async(req,res)=>{
  try{const u=await Utilisateur.findAll({include:[{model:Role,as:'role',attributes:['libelle']}],order:[['nom','ASC']]});res.json(u);}
  catch(e){res.status(500).json({message:'Erreur.'}); }
};
exports.detail=async(req,res)=>{
  try{const u=await Utilisateur.findByPk(req.params.id,{include:[{model:Role,as:'role'}]});if(!u)return res.status(404).json({message:'Introuvable.'});res.json(u);}
  catch(e){res.status(500).json({message:'Erreur.'}); }
};
exports.creer=async(req,res)=>{
  try{const{nom,prenom,email,motDePasse,roleId}=req.body;const e=await Utilisateur.findOne({where:{email}});if(e)return res.status(409).json({message:'Email deja utilise.'});const u=await Utilisateur.create({nom,prenom,email,mot_de_passe:motDePasse,role_id:roleId});res.status(201).json(u);}
  catch(e){res.status(500).json({message:'Erreur.'}); }
};
exports.modifier=async(req,res)=>{
  try{const u=await Utilisateur.findByPk(req.params.id);if(!u)return res.status(404).json({message:'Introuvable.'});await u.update(req.body);res.json(u);}
  catch(e){res.status(500).json({message:'Erreur.'}); }
};
exports.desactiver=async(req,res)=>{
  try{const u=await Utilisateur.findByPk(req.params.id);if(!u)return res.status(404).json({message:'Introuvable.'});await u.update({actif:false});res.json({message:'Desactive.'});}
  catch(e){res.status(500).json({message:'Erreur.'}); }
};