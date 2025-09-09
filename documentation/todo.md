# Action github back prod
#            TODO : Adaptger quand db sera en place
#             ======================================================
#             Étape optionnelle : exécuter Prisma migrate
#             Décommente quand ta DB est en place
#
#             echo "==> Exécution des migrations Prisma"
#             docker run --rm \
#               --network "$NET" \
#               -e DATABASE_URL="mysql://app:apppass@sentinel-mysql:3306/back" \
#               "$IMAGE" npx prisma migrate deploy
#             ======================================================
#