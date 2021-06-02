const router = require('express').Router();
const { Category, Product, ProductTag } = require('../../models');

// `/api/categories` endpoint

router.get('/', async (req, res) => {
  try {
    const categoryData = await Category.findAll({
      include: [{all: true}],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// finds one category by its `id` valu
router.get('/:id', async (req, res) => {
  try {
    const categoryData = await Category.findByPk({
      include: [{all: true}],
    });
    res.status(200).json(categoryData);
  } catch(err) {
    res.status(500).json(err);
  }
});

// creates a new category
router.post('/', (req, res) => {
 Category.create(req.body)
 .then((category) => {
    if (req.body.productIds.length) {
      const categoryProductIdsArr = req.body.productIds.map((product_id) => {
        return {
          category_id: category.id,
          product_id
        };
      });
      return ProductTag.bulkCreate(categoryProductIdsArr);
    }
    res.status(200).json(category);
 })
 .then((categoryProductId) => res.status(200).json(categoryProductId))
 .catch((err) => {
   console.log(err);
   res.status(400).json(err);
 });
});

// updates a category by its `id` value
router.put('/:id', (req, res) => {
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
  .then((category) => res.json(category))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

// delete a category by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!categoryData) {
      res.status(404).json({ message: 'No category found with that ID.' });
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;